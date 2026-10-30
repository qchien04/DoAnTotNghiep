/**
 * Bộ tiện ích định dạng nhãn hiển thị Tiếng Việt cho toàn bộ Enum của hệ thống
 */

/**
 * 1. Hình thức tính giá dịch vụ tiện ích (BillingMethod)
 */
export const getBillingMethodLabel = (method?: string | null): string => {
  switch (method) {
    case 'METER_INDEX':
      return 'Tính theo chỉ số công tơ';
    case 'FIXED_PER_ROOM':
      return 'Cố định theo phòng';
    case 'FIXED_PER_PERSON':
      return 'Cố định theo số người ở';
    case 'FIXED_PER_UNIT':
      return 'Theo lượng sử dụng phát sinh';
    default:
      return method || 'Cố định hàng tháng';
  }
};

export const getBillingMethodShortLabel = (method?: string | null): string => {
  switch (method) {
    case 'METER_INDEX':
      return 'Theo công tơ';
    case 'FIXED_PER_ROOM':
      return 'Cố định/phòng';
    case 'FIXED_PER_PERSON':
      return 'Theo người';
    case 'FIXED_PER_UNIT':
      return 'Theo lượng';
    default:
      return 'Cố định';
  }
};

/**
 * 2. Giới tính & Tiêu chuẩn giới tính (Gender & GenderPreference)
 */
export const getGenderLabel = (gender?: string | null): string => {
  switch (gender) {
    case 'MALE':
      return 'Nam';
    case 'FEMALE':
      return 'Nữ';
    case 'OTHER':
      return 'Khác';
    default:
      return gender || 'Chưa cập nhật';
  }
};

export const getGenderPreferenceLabel = (pref?: string | null): string => {
  switch (pref) {
    case 'MALE_ONLY':
      return 'Chỉ Nam';
    case 'FEMALE_ONLY':
      return 'Chỉ Nữ';
    case 'ANY':
      return 'Nam hoặc Nữ (Linh hoạt)';
    default:
      return pref || 'Linh hoạt';
  }
};

/**
 * 3. Trạng thái phòng trọ (RoomStatus)
 */
export const getRoomStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'Còn trống';
    case 'OCCUPIED':
      return 'Đang ở';
    case 'UNDER_MAINTENANCE':
      return 'Đang bảo trì';
    case 'STOPPED':
      return 'Ngừng hoạt động';
    default:
      return status || 'Chưa xác định';
  }
};

/**
 * 4. Trạng thái hợp đồng thuê (ContractStatus)
 */
export const getContractStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Đang hiệu lực';
    case 'TERMINATED':
      return 'Đã thanh lý';
    default:
      return status || 'Chưa xác định';
  }
};

/**
 * 5. Trạng thái hóa đơn tiền phòng (InvoiceStatus / BillStatus)
 */
export const getInvoiceStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'DRAFT':
      return 'Bản nháp';
    case 'UNPAID':
      return 'Chờ thanh toán';
    case 'PARTIALLY_PAID':
      return 'Thanh toán 1 phần';
    case 'PAID':
      return 'Đã thanh toán';
    case 'OVERDUE':
      return 'Quá hạn';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status || 'Chưa xác định';
  }
};

/**
 * 6. Sự cố & Khiếu nại báo hỏng (ComplaintIncidentType, ComplaintSeverity, ComplaintStatus)
 */
export const getComplaintIncidentTypeLabel = (type?: string | null): string => {
  switch (type) {
    case 'ELECTRICITY':
      return 'Điện sinh hoạt';
    case 'WATER':
      return 'Nước sinh hoạt';
    case 'AIR_CONDITIONER':
      return 'Điều hòa & Điện lạnh';
    case 'SECURITY':
      return 'An ninh trật tự';
    case 'OTHER':
      return 'Sự cố cơ sở vật chất khác';
    default:
      return type || 'Sự cố khác';
  }
};

export const getComplaintSeverityLabel = (severity?: string | null): string => {
  switch (severity) {
    case 'URGENT':
      return 'Khẩn cấp';
    case 'HIGH':
      return 'Cao';
    case 'MEDIUM':
      return 'Trung bình';
    case 'LOW':
      return 'Thấp';
    default:
      return severity || 'Bình thường';
  }
};

export const getComplaintStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'PENDING':
      return 'Chờ tiếp nhận';
    case 'PROCESSING':
      return 'Đang xử lý';
    case 'RESOLVED':
      return 'Đã xử lý';
    case 'REJECTED':
      return 'Từ chối';
    default:
      return status || 'Chưa xác định';
  }
};

/**
 * 7. Khách thuê phòng (TenantLinkStatus, TenantStatus)
 */
export const getTenantLinkStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'LINKED':
      return 'Đã liên kết';
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'NOT_LINKED':
      return 'Chưa liên kết';
    case 'UNLINKED':
      return 'Đã hủy liên kết';
    default:
      return status || 'Chưa liên kết';
  }
};

export const getTenantStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'STAYING':
      return 'Đang ở';
    case 'LEFT':
      return 'Đã chuyển đi';
    default:
      return status || 'Chưa xác định';
  }
};

/**
 * 8. Bài đăng & Ứng tuyển ở ghép (RoommatePostType, RoommatePostStatus, ApplicationStatus, InvitationStatus)
 */
export const getRoommatePostTypeLabel = (postType?: string | null): string => {
  switch (postType) {
    case 'HAS_ROOM':
      return 'Đã có phòng sẵn';
    case 'SEARCHING_ROOM':
      return 'Tìm bạn cùng thuê';
    default:
      return postType || 'Ở ghép';
  }
};

export const getRoommatePostStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'OPEN':
      return 'Đang mở';
    case 'COMPLETED':
      return 'Đã ghép đủ';
    case 'CLOSED':
      return 'Đã đóng';
    default:
      return status || 'Đang mở';
  }
};

export const getRoommateApplicationStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xét duyệt';
    case 'APPROVED':
      return 'Đã duyệt vào phòng';
    case 'REJECTED':
      return 'Đã từ chối';
    default:
      return status || 'Chờ duyệt';
  }
};

export const getInvitationStatusLabel = (status?: string | null): string => {
  switch (status) {
    case 'PENDING':
      return 'Chờ phản hồi';
    case 'ACCEPTED':
      return 'Đã chấp nhận';
    case 'REJECTED':
      return 'Đã từ chối';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'EXPIRED':
      return 'Đã hết hạn';
    default:
      return status || 'Chờ phản hồi';
  }
};

export const getTenantRoleInRoomLabel = (role?: string | null): string => {
  switch (role) {
    case 'REPRESENTATIVE':
      return 'Khách đại diện';
    case 'MEMBER':
      return 'Thành viên cùng phòng';
    default:
      return role || 'Thành viên';
  }
};

