import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from services.qr_scanner import scan_qr_from_image_bytes
from services.face_verifier import verify_face_match

app = FastAPI(
    title="StayConnect AI KYC Service",
    description="Dịch vụ nhận diện khuôn mặt DeepFace & Quét mã QR CCCD gắn chip",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "StayConnect AI KYC Service",
        "version": "1.0.0",
        "features": ["DeepFace", "ZXing-C++ QR Scanner", "Vietnamese CCCD Parser"]
    }

@app.post("/api/ai/kyc/scan-qr")
async def scan_cccd_qr(front_card: UploadFile = File(...)):
    """
    Quét và trích xuất dữ liệu từ mã QR trên mặt trước thẻ CCCD.
    """
    try:
        content = await front_card.read()
        if not content:
            raise HTTPException(status_code=400, detail="Tệp ảnh mặt trước CCCD bị rỗng")
        
        qr_result = scan_qr_from_image_bytes(content)
        return {
            "success": True,
            "data": qr_result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Lỗi trong quá trình quét mã QR CCCD"
        }

@app.post("/api/ai/kyc/verify")
async def verify_kyc(
    front_card: UploadFile = File(..., description="Ảnh mặt trước CCCD có ảnh chân dung và mã QR"),
    face_file: UploadFile = File(..., description="Video quay khuôn mặt hoặc ảnh selfie trực tiếp"),
    model_name: Optional[str] = Form("ArcFace"),
    detector_backend: Optional[str] = Form("retinaface"),
    liveness_score: Optional[float] = Form(100.0)
):
    """
    Xác thực toàn diện hồ sơ KYC:
    1. Quét và trích xuất thông tin định danh từ mã QR CCCD bằng wechat_qrcode.
    2. Tiền xử lý chân dung CCCD (crop 18% padding + bilateralFilter khử vân bảo an).
    3. So khớp khuôn mặt bằng ArcFace + RetinaFace, trích xuất embedding 512 chiều.
    4. Phân loại 3 tầng: AUTO_APPROVED (<0.40), CONDITIONAL_LIVENESS (0.40-0.55), RETAKE_OR_MANUAL (>0.55).
    """
    try:
        front_card_bytes = await front_card.read()
        face_file_bytes = await face_file.read()

        if not front_card_bytes:
            raise HTTPException(status_code=400, detail="Tệp ảnh CCCD mặt trước rỗng")
        if not face_file_bytes:
            raise HTTPException(status_code=400, detail="Tệp video/khuôn mặt xác thực rỗng")

        # 1. Quét mã QR mặt trước CCCD
        qr_data = scan_qr_from_image_bytes(front_card_bytes)

        # 2. Nhận diện định dạng tệp khuôn mặt (video hay ảnh)
        content_type = face_file.content_type or ""
        filename = (face_file.filename or "").lower()
        is_video = (
            "video" in content_type or
            filename.endswith(".mp4") or
            filename.endswith(".webm") or
            filename.endswith(".mov") or
            filename.endswith(".avi") or
            filename.endswith(".mkv")
        )

        # 3. So khớp khuôn mặt bằng DeepFace ArcFace + RetinaFace
        effective_liveness = float(liveness_score) if liveness_score is not None else 100.0
        face_data = verify_face_match(
            cccd_image_bytes=front_card_bytes,
            live_face_bytes=face_file_bytes,
            is_video=is_video,
            model_name=model_name or "ArcFace",
            detector_backend=detector_backend or "retinaface",
            liveness_score=effective_liveness
        )

        overall_verified = face_data.get("verified", False)

        return {
            "success": True,
            "overall_verified": overall_verified,
            "decision_tier": face_data.get("decision_tier", "MANUAL_REVIEW_OR_RETAKE"),
            "distance": face_data.get("distance", 1.0),
            "threshold": face_data.get("threshold", 0.68),
            "qr_result": qr_data,
            "face_result": face_data
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Lỗi hệ thống khi xác thực KYC AI: {str(e)}"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
