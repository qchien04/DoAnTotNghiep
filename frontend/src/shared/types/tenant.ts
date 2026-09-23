/**
 * Định nghĩa kiểu dữ liệu cho Role: Người thuê (Tenant) - 17 Use Cases (UC 30 - 46)
 */

export interface LifestyleSurvey {
  genderPreference: 'MALE' | 'FEMALE' | 'ANY';
  sleepTime: 'BEFORE_23H' | 'AROUND_23H_24H' | 'AFTER_24H';
  smoking: boolean;
  petFriendly: boolean;
  cookingFrequency: 'DAILY' | 'SOMETIMES' | 'RARELY';
  cleanlinessLevel: 'VERY_CLEAN' | 'MODERATE' | 'FLEXIBLE';
  personality: 'INTROVERT' | 'EXTROVERT' | 'BALANCED';
  guestsAllowed: 'WEEKENDS_ONLY' | 'ANYTIME' | 'NEVER';
}

// 1. Bài đăng ở ghép (UC 30 - 35, 40)
export type RoommatePostType = 'HAS_ROOM' | 'SEARCHING_ROOM';
export type RoommatePostStatus = 'OPEN' | 'COMPLETED' | 'CLOSED';

export interface RoommatePost {
  id: string;
  code: string; // BG01, BG02...
  title: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  postType: RoommatePostType;
  areaName: string; // Ngõ 80 Cầu Giấy, HN...
  district: string;
  city: string;
  sharePrice: number; // VNĐ
  totalRoomPrice?: number;
  neededRoommates: number;
  currentRoommates: number;
  roomInfo?: {
    roomId?: string;
    roomName?: string;
    areaSize?: number;
    amenities: string[];
    images: string[];
    address: string;
  };
  mapLocation?: {
    centerAddress: string;
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  lifestyle: LifestyleSurvey;
  description: string;
  matchPercentage?: number; // % tương thích được tính động
  status: RoommatePostStatus;
  pendingApplicantsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostWithRoomDto {
  title: string;
  isExistingLinkedRoom: boolean;
  roomId?: string;
  roomAddress: string;
  district: string;
  city: string;
  totalRoomPrice: number;
  sharePrice: number;
  neededRoommates: number;
  amenities: string[];
  images: string[];
  lifestyle: LifestyleSurvey;
  description: string;
}

export interface CreatePostWithoutRoomDto {
  title: string;
  centerAddress: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  budgetMax: number;
  neededRoommates: number;
  lifestyle: LifestyleSurvey;
  description: string;
}

export interface UpdateRoommatePostDto {
  title?: string;
  sharePrice?: number;
  images?: string[];
  description?: string;
  lifestyle?: Partial<LifestyleSurvey>;
}

export interface PostSearchParams {
  keyword?: string;
  district?: string;
  postType?: RoommatePostType | 'ALL';
  minPrice?: number;
  maxPrice?: number;
  gender?: 'MALE' | 'FEMALE' | 'ANY';
  sleepTime?: string;
  noSmoking?: boolean;
  petFriendly?: boolean;
  page?: number;
  size?: number;
}

// 2. Ứng tuyển & Quản lý nhóm ở ghép (UC 36 - 39)
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RoommateApplication {
  id: string;
  code: string; // YCGN-105...
  postId: string;
  postTitle?: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  birthYear?: number;
  hometown?: string;
  occupationOrSchool?: string;
  phone?: string;
  zaloContact?: string;
  introMessage: string;
  lifestyle: LifestyleSurvey;
  compatibilityScore: number; // 94%
  compatibilitySummary?: {
    criterion: string;
    applicantValue: string;
    hostValue: string;
    matched: boolean;
  }[];
  status: ApplicationStatus;
  rejectReason?: string;
  createdAt: string;
}

export interface ApplyRoommateDto {
  postId: string;
  introMessage: string;
  lifestyle: LifestyleSurvey;
}

// 3. Phòng của tôi & Lời mời liên kết (UC 41 - 42)
export interface RoomLinkInvitation {
  id: string;
  landlordName: string;
  landlordPhone: string;
  buildingName: string;
  roomName: string;
  address: string;
  monthlyRent: number;
  roleInRoom: 'REPRESENTATIVE' | 'MEMBER';
  inviteDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface MyRoomDetails {
  hasLinkedRoom: boolean;
  room?: {
    id: string;
    name: string;
    buildingName: string;
    address: string;
    monthlyRent: number;
    deposit: number;
    area: number;
    roommates: {
      name: string;
      role: string;
      phone: string;
      avatar?: string;
    }[];
    amenities: string[];
    landlord: {
      name: string;
      phone: string;
      bankAccount?: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
      };
    };
  };
  contract?: {
    contractNumber: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    depositAmount: number;
    initialElectricity: number;
    initialWater: number;
    services: { name: string; price: number; unit: string }[];
  };
}

// 4. Lịch sử hóa đơn & Thanh toán VietQR (UC 43 - 44)
export interface VietQRPaymentData {
  billNumber: string;
  amount: number;
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  bankCode: string;
  qrCodeUrl: string; // Dynamic VietQR image
  transferContent: string; // HD202610 P102
}

// 5. Báo hỏng sự cố của Người thuê (UC 45 - 46)
export interface CreateTenantComplaintDto {
  type: 'COOLING' | 'PLUMBING' | 'ELECTRICITY' | 'SECURITY' | 'OTHER';
  title: string;
  content: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  images?: string[];
}

export interface RateComplaintDto {
  rating: number; // 1 - 5 sao
  feedback?: string;
}
