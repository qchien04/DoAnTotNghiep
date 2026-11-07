import os
import tempfile
import logging
from typing import Dict, Any, Tuple, Optional, List
import cv2
# pyrefly: ignore [missing-import]
import numpy as np
from deepface import DeepFace

logger = logging.getLogger("face_verifier")

def extract_best_frame_from_video(video_path: str) -> np.ndarray:
    """
    Trích xuất khung hình rõ nét nhất (độ biến thiên Laplacian cao nhất) từ video quay khuôn mặt.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Không thể mở tệp video để trích xuất khung hình")

    best_frame = None
    max_variance = -1.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Lấy mẫu tối đa 15 khung hình rải đều trong video
    step = max(1, frame_count // 15) if frame_count > 0 else 1
    current_index = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if current_index % step == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Đo độ sắc nét của khung hình bằng phương sai Laplacian
            variance = cv2.Laplacian(gray, cv2.CV_64F).var()
            if variance > max_variance:
                max_variance = variance
                best_frame = frame.copy()

        current_index += 1

    cap.release()

    if best_frame is None:
        raise ValueError("Video không chứa khung hình hợp lệ")

    return best_frame


def preprocess_id_card_face(cccd_image_path: str, output_path: str) -> bool:
    """
    Tiền xử lý ảnh chân dung CCCD trước khi so khớp:
    1. Cắt (crop) khuôn mặt dư ra khoảng 15-20% viền padding quanh cằm và trán để RetinaFace có không gian căn chỉnh trục mắt.
    2. Áp dụng cv2.bilateralFilter nhẹ để làm mịn lớp hoa văn bảo an in đè trên mặt thẻ.
    """
    try:
        img = cv2.imread(cccd_image_path)
        if img is None:
            logger.warning("Không thể đọc ảnh CCCD từ đường dẫn: %s", cccd_image_path)
            return False

        # Dùng RetinaFace để phát hiện tọa độ khuôn mặt trên thẻ
        extracted_faces = DeepFace.extract_faces(
            img_path=cccd_image_path,
            detector_backend="retinaface",
            enforce_detection=False,
            align=False
        )

        if extracted_faces and len(extracted_faces) > 0 and extracted_faces[0].get("facial_area"):
            fa = extracted_faces[0]["facial_area"]
            x, y, w, h = fa.get("x", 0), fa.get("y", 0), fa.get("w", 0), fa.get("h", 0)

            # Chỉ crop khi vùng mặt có kích thước hợp lệ
            if w > 20 and h > 20:
                # Padding 18% viền quanh cằm, trán và hai bên má
                pad_h = int(h * 0.18)
                pad_w = int(w * 0.18)

                img_h, img_w = img.shape[:2]
                y1 = max(0, y - pad_h)
                y2 = min(img_h, y + h + pad_h)
                x1 = max(0, x - pad_w)
                x2 = min(img_w, x + w + pad_w)

                cropped_face = img[y1:y2, x1:x2]

                # Áp dụng bilateralFilter làm mịn hoa văn bảo an chống giả mà vẫn giữ nét chi tiết cạnh mắt, mũi, miệng
                smoothed_face = cv2.bilateralFilter(cropped_face, d=9, sigmaColor=75, sigmaSpace=75)
                cv2.imwrite(output_path, smoothed_face)
                logger.info("Đã tiền xử lý thành công chân dung thẻ CCCD (kích thước: %dx%d)", cropped_face.shape[1], cropped_face.shape[0])
                return True

        # Fallback: Nếu không tìm thấy vùng mặt bằng RetinaFace hoặc quá mờ, áp dụng bilateralFilter toàn ảnh
        smoothed_full = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)
        cv2.imwrite(output_path, smoothed_full)
        logger.info("RetinaFace không tách được bbox riêng, đã áp dụng lọc làm mịn toàn ảnh thẻ CCCD.")
        return True

    except Exception as e:
        logger.warning("Lỗi khi tiền xử lý ảnh thẻ CCCD: %s. Giữ nguyên ảnh gốc.", str(e))
        return False


def verify_face_match(
    cccd_image_bytes: bytes,
    live_face_bytes: bytes,
    is_video: bool = False,
    model_name: str = "ArcFace",
    detector_backend: str = "retinaface",
    liveness_score: float = 100.0
) -> Dict[str, Any]:
    """
    So khớp khuôn mặt trên ảnh CCCD với video/ảnh khuôn mặt thực tế bằng DeepFace (ArcFace + RetinaFace).
    Phân loại kết quả theo 3 tầng (3 Tiers):
    - Tầng 1: distance < 0.40 -> Tự động phê duyệt ngay lập tức (AUTO_APPROVED), cấp tick xanh.
    - Tầng 2: 0.40 <= distance <= 0.55 -> Phê duyệt nếu bài test liveness đạt điểm cao (CONDITIONAL_LIVENESS).
    - Tầng 3: distance > 0.55 -> Báo người dùng chụp lại ở nơi đủ sáng hoặc chuyển kiểm duyệt thủ công (RETAKE_OR_MANUAL_REVIEW).
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        raw_cccd_path = os.path.join(tmp_dir, "raw_cccd_front.jpg")
        with open(raw_cccd_path, "wb") as f:
            f.write(cccd_image_bytes)

        preprocessed_cccd_path = os.path.join(tmp_dir, "preprocessed_cccd.jpg")
        # Tiền xử lý: Cắt mở rộng viền padding 15-20% và khử hoa văn bảo an bằng bilateralFilter
        preprocess_success = preprocess_id_card_face(raw_cccd_path, preprocessed_cccd_path)
        final_cccd_path = preprocessed_cccd_path if (preprocess_success and os.path.exists(preprocessed_cccd_path)) else raw_cccd_path

        live_face_path = os.path.join(tmp_dir, "live_face.jpg")

        if is_video:
            video_temp_path = os.path.join(tmp_dir, "live_video.webm")
            with open(video_temp_path, "wb") as f:
                f.write(live_face_bytes)
            
            try:
                best_frame = extract_best_frame_from_video(video_temp_path)
                cv2.imwrite(live_face_path, best_frame)
            except Exception as e:
                logger.warning("Lỗi trích xuất video webm: %s. Thử đổi đuôi mp4...", e)
                try:
                    mp4_path = os.path.join(tmp_dir, "live_video.mp4")
                    with open(mp4_path, "wb") as f:
                        f.write(live_face_bytes)
                    best_frame = extract_best_frame_from_video(mp4_path)
                    cv2.imwrite(live_face_path, best_frame)
                except Exception as e2:
                    logger.warning("Không thể trích xuất khung hình từ video: %s. Thử đọc như ảnh.", e2)
                    with open(live_face_path, "wb") as f:
                        f.write(live_face_bytes)
        else:
            with open(live_face_path, "wb") as f:
                f.write(live_face_bytes)

        try:
            # 1. Chạy DeepFace verify với ArcFace + RetinaFace và căn chỉnh trục mắt (align=True)
            result = DeepFace.verify(
                img1_path=final_cccd_path,
                img2_path=live_face_path,
                model_name=model_name or "ArcFace",
                detector_backend=detector_backend or "retinaface",
                distance_metric="cosine",
                align=True,
                enforce_detection=False
            )

            distance = float(result.get("distance", 1.0))
            # ArcFace Cosine Distance threshold chuẩn là ~0.68
            threshold = float(result.get("threshold", 0.68))

            # 2. Trích xuất vector embedding 512 chiều từ ảnh selfie
            face_embedding: List[float] = []
            try:
                emb_objs = DeepFace.represent(
                    img_path=live_face_path,
                    model_name=model_name or "ArcFace",
                    detector_backend=detector_backend or "retinaface",
                    align=True,
                    enforce_detection=False
                )
                if emb_objs and len(emb_objs) > 0 and "embedding" in emb_objs[0]:
                    face_embedding = [float(round(val, 6)) for val in emb_objs[0]["embedding"]]
            except Exception as emb_ex:
                logger.warning("Không thể trích xuất vector embedding 512 chiều: %s", emb_ex)

            # 3. Cấu hình 3 tầng phân loại kết quả (3 Tiers Classification):
            # Tầng 1: distance < 0.40 -> Tự động duyệt thành công ngay, cấp tick xanh
            # Tầng 2: 0.40 <= distance <= 0.55 -> Duyệt nếu bài test liveness đạt điểm cao (>= 70%)
            # Tầng 3: distance > 0.55 -> Báo chụp lại ở nơi đủ sáng hoặc chuyển kiểm duyệt thủ công
            decision_tier = "MANUAL_REVIEW_OR_RETAKE"
            verified = False
            tier_description = ""

            if distance < 0.40:
                decision_tier = "AUTO_APPROVED"
                verified = True
                tier_description = f"Khoảng cách vector đạt mức tuyệt đối ({distance:.4f} < 0.40). Hệ thống tự động duyệt ngay lập tức."
            elif 0.40 <= distance <= 0.55:
                decision_tier = "CONDITIONAL_LIVENESS"
                # Đánh giá kết hợp điểm liveness người thật
                if liveness_score >= 70.0:
                    verified = True
                    tier_description = f"Khoảng cách vector ({distance:.4f}) nằm trong ngưỡng an toàn kết hợp bài test người thật đạt ({liveness_score:.1f}%). Hệ thống phê duyệt thành công."
                else:
                    verified = False
                    tier_description = f"Khoảng cách vector ({distance:.4f}) khá tốt, nhưng điểm kiểm tra người thật ({liveness_score:.1f}%) chưa đạt chuẩn. Hồ sơ được gửi Quản trị viên duyệt."
            else:
                decision_tier = "RETAKE_OR_MANUAL_REVIEW"
                verified = False
                tier_description = f"Khoảng cách vector ({distance:.4f}) vượt ngưỡng 0.55. Vui lòng chụp lại ở nơi đủ sáng, không đeo kính, hoặc hồ sơ sẽ chờ Quản trị viên đối soát thủ công."

            # Tính điểm tương đồng chuẩn hóa theo thang % (0% - 100%) hiển thị cho người dùng
            if distance < threshold:
                similarity = 100.0 - (distance / threshold) * 25.0
            else:
                max_span = max(0.01, 1.0 - threshold)
                similarity = max(0.0, 75.0 - ((distance - threshold) / max_span) * 75.0)

            similarity = round(min(100.0, max(0.0, similarity)), 2)

            return {
                "verified": verified,
                "decision_tier": decision_tier,
                "tier_description": tier_description,
                "similarity_score": similarity,
                "distance": round(distance, 4),
                "threshold": round(threshold, 4),
                "liveness_score": round(liveness_score, 2),
                "model_name": model_name or "ArcFace",
                "detector": detector_backend or "retinaface",
                "embedding_dim": len(face_embedding),
                "face_embedding": face_embedding,
                "message": tier_description
            }

        except Exception as ex:
            logger.error("Lỗi khi chạy DeepFace ArcFace + RetinaFace: %s", str(ex), exc_info=True)
            return {
                "verified": False,
                "decision_tier": "ERROR",
                "tier_description": f"Không thể so khớp khuôn mặt: {str(ex)}",
                "similarity_score": 0.0,
                "distance": 1.0,
                "threshold": 0.68,
                "liveness_score": round(liveness_score, 2),
                "model_name": model_name or "ArcFace",
                "detector": detector_backend or "retinaface",
                "face_embedding": [],
                "error": str(ex),
                "message": f"Không thể so khớp khuôn mặt: {str(ex)}"
            }
