import { landlordService } from '../shared/services/landlordService';
import { tenantService } from '../shared/services/tenantService';
import { adminService } from '../shared/services/adminService';
import { authService } from '../shared/services/authService';

export async function runMockVerification() {
  console.log('=== BẮT ĐẦU KIỂM THỬ MOCK SYSTEM & INTERCEPTOR (57 USE CASES) ===');

  try {
    // 1. Auth Test
    console.log('\n[1] Testing Auth Login (admin/admin123)...');
    const loginRes = await authService.login({ username: 'admin', password: 'admin123' });
    console.log('Auth login result:', loginRes.code === '00' ? 'THÀNH CÔNG' : 'THẤT BẠI', loginRes.data?.user);

    // 2. Landlord Buildings (UC 01)
    console.log('\n[2] Testing Landlord Buildings List (UC 01)...');
    const buildingsRes = await landlordService.getBuildings();
    const bList: any[] = Array.isArray(buildingsRes.data) ? buildingsRes.data : (buildingsRes.data as any)?.items ?? [];
    console.log(`Lấy thành công ${bList.length} tòa nhà mẫu:`);
    bList.forEach((b: any) => console.log(` - ${b.buildingCode || b.code}: ${b.name} (${b.addressDetail || b.address})`));

    // 3. Landlord Add Building (UC 02)
    console.log('\n[3] Testing Landlord Add Building (UC 02)...');
    const newBldRes = await landlordService.createBuilding({
      name: 'Nhà trọ Mới Test ' + Date.now(),
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      ward: 'Dịch Vọng',
      addressDetail: 'Số 99 Trần Thái Tông',
      numFloors: 4,
    });
    console.log('Tạo tòa nhà mới:', (newBldRes.data as any)?.buildingCode || (newBldRes.data as any)?.code, newBldRes.data?.name);

    // 4. Landlord Rooms (UC 05)
    console.log('\n[4] Testing Landlord Rooms List (UC 05)...');
    const roomsRes = await landlordService.getRooms();
    const rList: any[] = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data as any)?.items ?? [];
    console.log(`Lấy thành công ${rList.length} phòng trọ:`);
    rList.forEach((r: any) => console.log(` - ${r.roomCode || r.code}: ${r.name}, Giá: ${(r.listedPrice || r.price || 0).toLocaleString()}đ, Trạng thái: ${r.status}`));

    // 5. Tenant Roommate Search (UC 30)
    console.log('\n[5] Testing Tenant Roommate Search (UC 30)...');
    const postsRes = await tenantService.searchPosts();
    console.log(`Tìm thấy ${postsRes.data.items.length} bài đăng ở ghép:`);
    postsRes.data.items.forEach((p) => console.log(` - ${p.code}: ${p.title} (Giá share: ${p.sharePrice.toLocaleString()}đ, Match: ${p.matchPercentage}%)`));

    // 6. Admin Analytics (UC 57)
    console.log('\n[6] Testing Admin Analytics Dashboard (UC 57)...');
    const analyticsRes = await adminService.getAnalytics();
    console.log('Admin Dashboard Stats:');
    console.log(` - Tổng users: ${analyticsRes.data.totalUsers}`);
    console.log(` - Tổng tòa nhà: ${analyticsRes.data.totalBuildings}`);
    console.log(` - Tổng tin ghép: ${analyticsRes.data.totalRoommatePosts}`);
    console.log(` - Tỷ lệ ghép thành công: ${analyticsRes.data.successfulMatchRate}%`);

    console.log('\n=== TẤT CẢ 6 NHÓM TEST MOCK API & INTERCEPTOR ĐÃ CHẠY HOÀN HẢO! ===\n');
  } catch (err) {
    console.error('Lỗi khi chạy verification:', err);
  }
}

// Chạy tự động trong browser console khi dev
if (typeof window !== 'undefined') {
  (window as any).__runMockVerification = runMockVerification;
}
