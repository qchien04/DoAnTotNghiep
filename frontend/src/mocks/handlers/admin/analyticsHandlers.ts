import { MockRouteHandler } from '../../mockAdapter';
import { successResponse } from '../../utils/response';
import { AdminAnalyticsData } from '@/shared/types/admin';

export const analyticsHandlers: Record<string, MockRouteHandler> = {
  // UC 57: Dashboard thống kê toàn hệ thống
  'GET /api/admin/analytics': () => {
    const data: AdminAnalyticsData = {
      totalUsers: 12450,
      newUsersThisMonth: 1250,
      totalLandlords: 4250,
      totalTenants: 8200,
      totalBuildings: 1580,
      newBuildingsThisMonth: 140,
      totalRoommatePosts: 3420,
      newPostsThisMonth: 450,
      successfulMatchRate: 76.4,
      successfulGroupsCount: 2612,
      topAreas: [
        { district: 'Cầu Giấy', city: 'Hà Nội', postCount: 950, percentage: 27.8 },
        { district: 'Hai Bà Trưng', city: 'Hà Nội', postCount: 780, percentage: 22.8 },
        { district: 'Đống Đa', city: 'Hà Nội', postCount: 620, percentage: 18.1 },
        { district: 'Thanh Xuân', city: 'Hà Nội', postCount: 540, percentage: 15.8 },
        { district: 'Bắc Từ Liêm', city: 'Hà Nội', postCount: 530, percentage: 15.5 },
      ],
      monthlyGrowthTrend: [
        { month: 'T05/2026', users: 9500, posts: 2100, successfulMatches: 1550 },
        { month: 'T06/2026', users: 10200, posts: 2400, successfulMatches: 1800 },
        { month: 'T07/2026', users: 10900, posts: 2750, successfulMatches: 2050 },
        { month: 'T08/2026', users: 11500, posts: 3050, successfulMatches: 2310 },
        { month: 'T09/2026', users: 12000, posts: 3280, successfulMatches: 2480 },
        { month: 'T10/2026', users: 12450, posts: 3420, successfulMatches: 2612 },
      ],
    };

    return successResponse(data);
  },
};
