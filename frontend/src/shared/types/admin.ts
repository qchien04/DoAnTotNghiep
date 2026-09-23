/**
 * Định nghĩa kiểu dữ liệu cho Role: Quản trị viên (Admin) - 11 Use Cases (UC 47 - 57)
 */

import { Role, User } from './auth';

// 1. Quản lý Người dùng hệ thống (UC 47 - 50)
export type UserAccountStatus = 'ACTIVE' | 'LOCKED';

export interface AdminUserItem extends User {
  status: UserAccountStatus;
  lockReason?: string;
  lockedAt?: string;
  roomCount?: number;
  postCount?: number;
}

export interface CreateAdminUserDto {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  enabled?: boolean;
}

export interface UpdateAdminUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: Role;
  enabled?: boolean;
}

export interface ToggleLockUserDto {
  locked: boolean;
  reason?: string;
  duration?: 'PERMANENT' | 'TEMPORARY';
}

export interface AdminUserFilterParams {
  keyword?: string;
  role?: Role | 'ALL';
  status?: UserAccountStatus | 'ALL';
  page?: number;
  size?: number;
}

// 2. Master Data (UC 51 - 54)
export type MasterDataType = 'LIFESTYLE_CRITERIA' | 'ROOM_AMENITY' | 'DISTRICT';

export interface LifestyleCriterion {
  id: string;
  code: string; // TC01, TC02...
  name: string;
  category: 'HABIT' | 'TIME' | 'SHARED_LIVING' | 'PRIVACY';
  algorithmWeight: number; // 25% (tổng các tiêu chí = 100%)
  options: string[];
  status: 'ACTIVE' | 'DEACTIVATED';
}

export interface RoomAmenityMaster {
  id: string;
  code: string;
  name: string;
  iconName: string;
  status: 'ACTIVE' | 'DEACTIVATED';
}

export interface DistrictMaster {
  id: string;
  code: string;
  name: string;
  city: string;
  popular: boolean;
}

export interface CreateLifestyleCriterionDto {
  code: string;
  name: string;
  category: 'HABIT' | 'TIME' | 'SHARED_LIVING' | 'PRIVACY';
  algorithmWeight: number;
  options: string[];
}

export interface UpdateLifestyleCriterionDto extends Partial<CreateLifestyleCriterionDto> {
  status?: 'ACTIVE' | 'DEACTIVATED';
}

// 3. Quản lý Báo cáo vi phạm (UC 55 - 56)
export type DisputeReportType = 'DEPOSIT_FRAUD' | 'FAKE_ROOM' | 'DEPOSIT_DISPUTE' | 'HARASSMENT' | 'OTHER';
export type DisputeReportStatus = 'PENDING' | 'MEDIATING' | 'RESOLVED' | 'REJECTED';

export interface DisputeReport {
  id: string;
  code: string; // BC201...
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string; // Bài đăng BG08 (UID312) hoặc Chủ trọ UID101
  targetType: 'POST' | 'USER';
  violationType: DisputeReportType;
  summary: string;
  evidenceImages: string[];
  createdAt: string;
  status: DisputeReportStatus;
  enforceActionsTaken?: string[];
  conclusionNote?: string;
}

export interface EnforceReportDto {
  action: 'DISMISS' | 'REMOVE_POST_AND_BAN' | 'WARN_USER' | 'RESOLVED_MEDIATION';
  removePost?: boolean;
  lockTargetUser?: boolean;
  conclusionNote: string;
}

// 4. Dashboard Phân tích sàn toàn hệ thống (UC 57)
export interface TopAreaDemand {
  district: string;
  city: string;
  postCount: number;
  percentage: number;
}

export interface AdminAnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalLandlords: number;
  totalTenants: number;
  totalBuildings: number;
  newBuildingsThisMonth: number;
  totalRoommatePosts: number;
  newPostsThisMonth: number;
  successfulMatchRate: number; // 76.4%
  successfulGroupsCount: number;
  topAreas: TopAreaDemand[];
  monthlyGrowthTrend: {
    month: string;
    users: number;
    posts: number;
    successfulMatches: number;
  }[];
}
