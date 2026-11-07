export type LandlordVerificationType = 'OWNERSHIP_CERTIFICATE' | 'AUTHORIZATION_CONTRACT';
export type LandlordVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface LandlordVerificationDocumentResponse {
  id: number;
  fileKey: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  viewUrl: string;
  downloadUrl: string;
  createdAt: string;
}

export interface LandlordVerificationResponse {
  id: number;
  userId: number;
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
  landlordAvatarUrl?: string;
  verificationType: LandlordVerificationType;
  verificationTypeDisplay: string;
  propertyAddress?: string;
  documentNumber?: string;
  notes?: string;
  status: LandlordVerificationStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  verifiedByName?: string | null;
  documents: LandlordVerificationDocumentResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface LandlordVerificationOverviewStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export interface LandlordVerificationSubmitPayload {
  verificationType: LandlordVerificationType;
  propertyAddress?: string;
  documentNumber?: string;
  notes?: string;
  files: File[];
}

