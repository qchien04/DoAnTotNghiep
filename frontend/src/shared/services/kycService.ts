import { apiClient } from '@/shared/services/api';
import { ResponseData } from '@/shared/types/api';
import { KycDocumentResponse, KycAiVerificationResponse, QrCccdInfo } from '@/shared/types/kyc';

function normalizeQrCccdInfo(d: any): QrCccdInfo {
  if (!d) {
    return {
      qrFound: false,
      message: 'Không nhận được dữ liệu giải mã QR',
    };
  }
  return {
    qrFound: Boolean(d.qrFound ?? d.qr_found),
    idCardNumber: d.idCardNumber ?? d.id_card_number ?? null,
    oldCmndNumber: d.oldCmndNumber ?? d.old_cmnd_number ?? null,
    fullName: d.fullName ?? d.full_name ?? null,
    dateOfBirth: d.dateOfBirth ?? d.date_of_birth ?? null,
    gender: d.gender ?? null,
    address: d.address ?? null,
    issueDate: d.issueDate ?? d.issue_date ?? null,
    rawText: d.rawText ?? d.raw_text ?? null,
    message: d.message ?? null,
  };
}

export const kycService = {
  /**
   * Lấy danh sách tài liệu xác thực danh tính của người dùng đang đăng nhập
   */
  async getMyDocuments(): Promise<KycDocumentResponse[]> {
    const res = await apiClient.get<ResponseData<KycDocumentResponse[]>>('/api/v1/secure/kyc/my-documents');
    return res.data.data;
  },

  /**
   * Gửi hồ sơ xác thực AI: Mặt trước CCCD + Mặt sau CCCD + Video/Ảnh khuôn mặt + Điểm Liveness
   */
  async verifyWithAi(
    frontCard: File,
    faceFile: File | Blob,
    backCard?: File | null,
    livenessScore?: number
  ): Promise<KycAiVerificationResponse> {
    const formData = new FormData();
    formData.append('frontCard', frontCard);
    
    // Nếu faceFile là Blob (ví dụ từ MediaRecorder), gán tên tệp phù hợp
    if (faceFile instanceof File) {
      formData.append('faceFile', faceFile);
    } else {
      formData.append('faceFile', faceFile, 'face_video.webm');
    }

    if (backCard) {
      formData.append('backCard', backCard);
    }

    if (livenessScore !== undefined && livenessScore !== null) {
      formData.append('livenessScore', livenessScore.toString());
    }

    const res = await apiClient.post<ResponseData<KycAiVerificationResponse>>(
      '/api/v1/secure/kyc/verify-ai',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },

  /**
   * Quét và trích xuất dữ liệu từ mã QR trên thẻ CCCD mặt trước
   * Tự động fallback gọi trực tiếp microservice Python nếu Backend chưa được restart.
   */
  async scanQr(frontCard: File): Promise<QrCccdInfo> {
    // 1. Thử gọi qua Backend Spring Boot
    try {
      const formData = new FormData();
      formData.append('frontCard', frontCard);
      const res = await apiClient.post<ResponseData<any>>(
        '/api/v1/secure/kyc/scan-qr',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (res.data?.data) {
        return normalizeQrCccdInfo(res.data.data);
      }
    } catch (err: any) {
      console.warn('Backend /scan-qr chưa sẵn sàng hoặc lỗi (404/500). Thử gọi trực tiếp AI Service cổng 8001...', err);
    }

    // 2. Fallback gọi trực tiếp Python AI Service nếu Backend chưa được restart
    try {
      const pythonFormData = new FormData();
      pythonFormData.append('front_card', frontCard);
      const pythonRes = await fetch('http://localhost:8001/api/ai/kyc/scan-qr', {
        method: 'POST',
        body: pythonFormData,
      });

      if (pythonRes.ok) {
        const json = await pythonRes.json();
        if (json.data) {
          return normalizeQrCccdInfo(json.data);
        }
      }
    } catch (pythonErr) {
      console.error('Không thể kết nối trực tiếp Python AI Service:', pythonErr);
    }

    // 3. Fallback an toàn: Trả về trạng thái chưa đọc được thay vì crash luồng
    return {
      qrFound: false,
      message: 'Không thể kết nối đến dịch vụ AI quét mã QR. Vui lòng đảm bảo backend hoặc python service đang hoạt động.',
    };
  },

  /**
   * Xóa một tài liệu xác thực danh tính
   */
  async deleteDocument(documentType: 'ID_CARD_FRONT' | 'ID_CARD_BACK' | 'SELFIE'): Promise<void> {
    await apiClient.delete<ResponseData<void>>(`/api/v1/secure/kyc/${documentType}`);
  },
};
