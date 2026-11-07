export interface RuleViolationDetail {
  ruleCode: string;
  ruleName: string;
  penaltyPoints: number;
  description: string;
}

export interface ContentDetectionDetail {
  hasPhoneNumber: boolean;
  detectedPhoneNumbers: string[];
  hasSocialMediaLink: boolean;
  detectedSocialLinks: string[];
  hasBankAccountOrPrepayment: boolean;
  detectedBankAccounts: string[];
  suspiciousPhrases: string[];
}

export interface RoomRiskEvaluationResult {
  totalRiskScore: number;
  moderationAction: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' | 'LOCKED_STOLEN_IMAGES' | string;
  roomStatus: string;
  isPublic: boolean;
  moderationReason: string;
  hasStolenImages: boolean;
  stolenFromRoomInfo?: string;
  triggeredRules: RuleViolationDetail[];
  contentDetection?: ContentDetectionDetail;
}

export interface RoomAuditLogItem {
  id: number;
  roomId: number;
  roomName: string;
  actorId: number;
  actorName: string;
  actorRole: string;
  action: 'CREATED' | 'UPDATED' | 'MODERATION_APPROVED' | 'MODERATION_REJECTED' | 'MODERATION_UNLOCKED' | string;
  oldStatus?: string;
  newStatus?: string;
  oldModerationStatus?: string;
  newModerationStatus?: string;
  riskScore?: number;
  reason?: string;
  changedSummary?: string;
  createdAt: string;
}

export interface RoomModerationItem {
  id: number;
  buildingId?: number;
  buildingName?: string;
  name: string;
  floor: number;
  area: number;
  listedPrice: number;
  standardDeposit: number;
  electricityPrice?: number;
  waterPrice?: number;
  riskScore?: number;
  riskEvaluationDetails?: string;
  moderationStatus: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' | 'LOCKED_STOLEN_IMAGES' | string;
  moderationReason?: string;
  moderatedAt?: string;
  moderatedByName?: string;
  maxCapacity: number;
  currentOccupancy: number;
  furnishingLevel?: string;
  amenities?: string[];
  description?: string;
  status: string;
  province?: string;
  ward?: string;
  addressDetail?: string;
  fullAddress?: string;
  imageUrls?: string[];
  watermarkedImageUrls?: string[];
  isPublic?: boolean;
  landlordId?: number;
  landlordName?: string;
  landlordPhone?: string;
  landlordAvatarUrl?: string;
  landlordVerified?: boolean;
  createdAt: string;
}

export interface RoomModerationDetailResponse {
  room: RoomModerationItem;
  riskEvaluation?: RoomRiskEvaluationResult;
  auditLogs: RoomAuditLogItem[];
}

