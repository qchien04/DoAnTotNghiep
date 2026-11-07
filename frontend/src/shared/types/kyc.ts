export interface QrCccdInfo {
  qrFound: boolean;
  idCardNumber?: string | null;
  oldCmndNumber?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  issueDate?: string | null;
  rawText?: string | null;
  message?: string | null;
}

export interface FaceVerificationInfo {
  verified: boolean;
  similarityScore: number;
  distance: number;
  threshold: number;
  modelName: string;
  detector?: string;
  decisionTier?: 'AUTO_APPROVED' | 'CONDITIONAL_LIVENESS' | 'RETAKE_OR_MANUAL_REVIEW' | string;
  tierDescription?: string;
  livenessScore?: number;
  embeddingDim?: number;
  faceEmbedding?: string;
  message: string;
}

export interface KycDocumentResponse {
  id: number;
  userId: number;
  documentType: 'ID_CARD_FRONT' | 'ID_CARD_BACK' | 'SELFIE';
  fileKey: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  idCardNumber?: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string | null;
  viewUrl: string;
  downloadUrl: string;
  createdAt: string;
}

export interface KycBundleResponse {
  frontCard: KycDocumentResponse;
  backCard?: KycDocumentResponse | null;
  selfie: KycDocumentResponse;
  idCardNumber?: string | null;
}

export interface KycAiVerificationResponse {
  overallVerified: boolean;
  decisionTier?: 'AUTO_APPROVED' | 'CONDITIONAL_LIVENESS' | 'RETAKE_OR_MANUAL_REVIEW' | string;
  distance?: number;
  threshold?: number;
  qrInfo: QrCccdInfo;
  faceInfo: FaceVerificationInfo;
  documents: KycBundleResponse;
  message: string;
}
