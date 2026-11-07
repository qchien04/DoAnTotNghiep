import os
import re
from datetime import datetime
from typing import Optional, Dict, Any
import cv2
import numpy as np
import zxingcpp

def parse_vietnamese_cccd_qr(qr_text: str) -> Dict[str, Any]:
    """
    Phân tích chuỗi QR trên thẻ CCCD gắn chip Việt Nam.
    Định dạng chuẩn:
    {Số CCCD}|{Số CMND cũ}|{Họ và tên}|{Ngày sinh ddMMyyyy}|{Giới tính}|{Địa chỉ thường trú}|{Ngày cấp ddMMyyyy}
    Ví dụ:
    001202012345||NGUYEN VAN A|15082000|Nam|So 123 Cau Giay, Ha Noi|10052021
    """
    parts = qr_text.strip().split('|')
    result: Dict[str, Any] = {
        "raw_text": qr_text,
        "is_valid_format": False,
        "id_card_number": None,
        "old_cmnd_number": None,
        "full_name": None,
        "date_of_birth": None,
        "gender": None,
        "address": None,
        "issue_date": None,
    }

    if len(parts) >= 5:
        result["is_valid_format"] = True
        result["id_card_number"] = parts[0].strip() if parts[0].strip() else None
        
        # Phần tử 1: Số CMND 9 số cũ (có thể rỗng)
        if len(parts) > 1 and parts[1].strip():
            result["old_cmnd_number"] = parts[1].strip()

        # Phần tử 2: Họ và tên
        if len(parts) > 2 and parts[2].strip():
            result["full_name"] = parts[2].strip()

        # Phần tử 3: Ngày sinh (ddMMyyyy)
        if len(parts) > 3 and parts[3].strip():
            dob_raw = parts[3].strip()
            try:
                dob_dt = datetime.strptime(dob_raw, "%d%m%Y")
                result["date_of_birth"] = dob_dt.strftime("%Y-%m-%d")
            except Exception:
                result["date_of_birth"] = dob_raw

        # Phần tử 4: Giới tính (Nam / Nữ)
        if len(parts) > 4 and parts[4].strip():
            result["gender"] = parts[4].strip()

        # Phần tử 5: Địa chỉ thường trú
        if len(parts) > 5 and parts[5].strip():
            result["address"] = parts[5].strip()

        # Phần tử 6: Ngày cấp (ddMMyyyy)
        if len(parts) > 6 and parts[6].strip():
            issue_raw = parts[6].strip()
            try:
                issue_dt = datetime.strptime(issue_raw, "%d%m%Y")
                result["issue_date"] = issue_dt.strftime("%Y-%m-%d")
            except Exception:
                result["issue_date"] = issue_raw
    # Thử regex trích xuất số CCCD 12 chữ số nếu định dạng không phân tách bởi dấu |
    if not result.get("id_card_number"):
        match_id = re.search(r'\b\d{12}\b', qr_text)
        if match_id:
            result["id_card_number"] = match_id.group(0)

    # Đồng bộ cả camelCase (Frontend) và snake_case (Backend/Python) để tránh undefined
    result["idCardNumber"] = result["id_card_number"]
    result["oldCmndNumber"] = result["old_cmnd_number"]
    result["fullName"] = result["full_name"]
    result["dateOfBirth"] = result["date_of_birth"]
    result["issueDate"] = result["issue_date"]
    result["rawText"] = result["raw_text"]
    result["isValidFormat"] = result["is_valid_format"]

    return result


# Khởi tạo WeChatQRCode Detector dạng singleton
_wechat_detector = None

def get_wechat_detector():
    global _wechat_detector
    if _wechat_detector is None:
        try:
            _wechat_detector = cv2.wechat_qrcode_WeChatQRCode()
        except Exception as e:
            print(f"Không thể khởi tạo cv2.wechat_qrcode_WeChatQRCode: {e}")
            _wechat_detector = None
    return _wechat_detector


def scan_qr_from_image_bytes(image_bytes: bytes) -> Dict[str, Any]:
    """
    Đọc mã QR từ mảng bytes hình ảnh bằng WeChatQRCode và ZXing kết hợp:
    1. Cắt vùng ROI góc trên bên phải (khu vực QR trên CCCD)
    2. Phóng to đa tỷ lệ (Multi-scale upscaling 2.0x, 3.0x, 1.5x) giải quyết triệt để QR kích thước nhỏ
    3. Cân bằng độ tương phản CLAHE & Làm nét ảnh (Unsharp Masking)
    4. Quét đa hướng (0, 90, 180, 270 độ) khi ảnh bị xoay
    """
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        return {"qr_found": False, "message": "Không thể giải mã tệp hình ảnh"}

    wechat = get_wechat_detector()

    def _try_decode_candidate(candidate: np.ndarray, tag: str) -> Optional[Dict[str, Any]]:
        """Hàm trợ giúp thử giải mã bằng WeChatQRCode trước, sau đó là ZXing-C++"""
        # 1. Thử WeChatQRCode
        if wechat is not None:
            try:
                res, _ = wechat.detectAndDecode(candidate)
                for text in res:
                    if text and text.strip():
                        parsed = parse_vietnamese_cccd_qr(text.strip())
                        return {"qr_found": True, "qrFound": True, "detector": f"wechat_{tag}", **parsed}
            except Exception:
                pass

        # 2. Thử ZXing-C++
        try:
            barcodes = zxingcpp.read_barcodes(candidate)
            for b in barcodes:
                if b.format == zxingcpp.BarcodeFormat.QRCode and b.text and b.text.strip():
                    parsed = parse_vietnamese_cccd_qr(b.text.strip())
                    return {"qr_found": True, "qrFound": True, "detector": f"zxing_{tag}", **parsed}
        except Exception:
            pass

        return None

    # --- BƯỚC 1: Quét trực tiếp ảnh gốc ---
    decoded = _try_decode_candidate(image, "full_original")
    if decoded:
        return decoded

    # --- BƯỚC 2: Quét vùng ROI góc trên bên phải với các tỷ lệ phóng to (Multi-scale) ---
    h, w = image.shape[:2]
    # Nửa trên (0 -> 65%) và nửa bên phải (45% -> 100%) của thẻ
    roi = image[0:int(h * 0.65), int(w * 0.45):w]

    if roi.size > 0:
        # Thử các hệ số phóng to cho ROI (2.0x và 3.0x giúp làm rõ các ô vuông finder pattern của QR nhỏ)
        for scale in [2.0, 3.0, 1.5, 2.5]:
            scaled_roi = cv2.resize(roi, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            decoded = _try_decode_candidate(scaled_roi, f"roi_scale_{scale}")
            if decoded:
                return decoded

            # Tiền xử lý CLAHE (Cân bằng histogram cục bộ khử lóa/tối)
            gray = cv2.cvtColor(scaled_roi, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            clahe_bgr = cv2.cvtColor(clahe.apply(gray), cv2.COLOR_GRAY2BGR)
            decoded = _try_decode_candidate(clahe_bgr, f"roi_scale_{scale}_clahe")
            if decoded:
                return decoded

            # Làm nét ảnh (Sharpening / Unsharp Masking)
            gaussian = cv2.GaussianBlur(scaled_roi, (0, 0), 2.0)
            sharpened = cv2.addWeighted(scaled_roi, 1.5, gaussian, -0.5, 0)
            decoded = _try_decode_candidate(sharpened, f"roi_scale_{scale}_sharpen")
            if decoded:
                return decoded

    # --- BƯỚC 3: Tiền xử lý toàn bộ ảnh nếu ROI chưa tìm ra ---
    gray_full = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe_full = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    clahe_full_bgr = cv2.cvtColor(clahe_full.apply(gray_full), cv2.COLOR_GRAY2BGR)
    decoded = _try_decode_candidate(clahe_full_bgr, "full_clahe")
    if decoded:
        return decoded

    # --- BƯỚC 4: Kiểm tra xoay ảnh (90, 180, 270 độ phòng trường hợp chụp ngang / lộn ngược) ---
    rotations = [
        (90, cv2.ROTATE_90_CLOCKWISE),
        (180, cv2.ROTATE_180),
        (270, cv2.ROTATE_90_COUNTERCLOCKWISE)
    ]
    for angle, rot_flag in rotations:
        rotated = cv2.rotate(image, rot_flag)
        rh, rw = rotated.shape[:2]
        r_roi = rotated[0:int(rh * 0.65), int(rw * 0.45):rw]
        if r_roi.size > 0:
            for scale in [1.0, 2.0, 3.0]:
                r_target = cv2.resize(r_roi, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC) if scale != 1.0 else r_roi
                decoded = _try_decode_candidate(r_target, f"rot_{angle}_roi_scale_{scale}")
                if decoded:
                    return decoded

    # --- BƯỚC 5: Fallback sang OpenCV QRCodeDetector chuẩn ---
    try:
        detector = cv2.QRCodeDetector()
        val, _, _ = detector.detectAndDecode(image)
        if val and val.strip():
            parsed = parse_vietnamese_cccd_qr(val.strip())
            return {"qr_found": True, "qrFound": True, "detector": "opencv_qr", **parsed}
    except Exception:
        pass

    return {
        "qr_found": False,
        "qrFound": False,
        "message": "Không phát hiện mã QR trên ảnh CCCD mặt trước. Vui lòng đảm bảo chụp rõ nét góc trên bên phải thẻ."
    }
