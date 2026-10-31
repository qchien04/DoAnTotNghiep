/**
 * Định nghĩa kiểu dữ liệu cho Role: Chủ trọ (Landlord) - Đồng bộ 100% với Backend Spring Boot & Database
 * Tuyệt đối không chứa các trường alias legacy hoặc các trường mã không tồn tại trong DB.
 *
 * QUY TẮC PHÂN TÁCH RÕ RÀNG:
 * 1. RESPONSE OBJECTS: Dữ liệu thực tế do Backend trả về (khớp với Entity / Response DTO của Spring Boot).
 * 2. REQUEST OBJECTS: Dữ liệu do Frontend đóng gói gửi lên Backend trong Body hoặc Params (khớp Request DTO).
 * Tuyệt đối KHÔNG dùng adapter alias chắp vá và KHÔNG gộp chung giữa Request và Response!
 */

import { PagingParams } from '@/shared/types/api';
import { Amenity } from './amenity';

// =========================================================================
// 1. Tòa nhà / Khu trọ (UC 01 - 04)
// =========================================================================

// --- 1.A. RESPONSE OBJECTS (Backend trả về) ---
export interface Building {
  id: number | string;
  name: string;
  province?: string;
  ward?: string;
  provinceId?: number;
  wardId?: number;
  provinceName?: string;
  wardName?: string;
  addressDetail?: string;
  numFloors?: number;
  generalRules?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  totalRooms?: number;
  occupiedRooms?: number;
  availableRooms?: number;
  createdAt?: string;
}

// --- 1.B. REQUEST OBJECTS (Frontend gửi lên) ---
export interface CreateBuildingDto {
  name: string;
  province?: string;
  ward?: string;
  provinceId?: number;
  wardId?: number;
  addressDetail?: string;
  numFloors?: number;
  generalRules?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateBuildingDto extends Partial<CreateBuildingDto> { }

export interface BuildingFilterParams extends PagingParams {
  keyword?: string;
  floors?: number;
}

// =========================================================================
// 2. Phòng trọ (UC 05 - 08)
// =========================================================================
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'STOPPED';

// --- 2.A. RESPONSE OBJECTS (Backend trả về) ---
export interface Room {
  id: number | string;
  buildingId?: number | string | null;
  buildingName?: string;
  name: string;
  floor: number;
  area: number;
  listedPrice: number;
  standardDeposit: number;
  maxCapacity: number;
  currentOccupancy?: number;
  furnishingLevel?: string;
  amenities?: string[];
  amenitiesMask?: number;
  amenityDetails?: Amenity[];
  serviceIds?: number[];
  services?: any[];
  description?: string;
  status: RoomStatus;
  province?: string;
  ward?: string;
  provinceId?: number;
  wardId?: number;
  provinceName?: string;
  wardName?: string;
  addressDetail?: string;
  fullAddress?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
  isPublic?: boolean;
  landlordName?: string;
  landlordPhone?: string;
  createdAt?: string;
}

// --- 2.B. REQUEST OBJECTS (Frontend gửi lên) ---
export interface CreateRoomDto {
  buildingId?: number | string | null;
  name: string;
  floor?: number;
  area: number;
  listedPrice: number;
  standardDeposit: number;
  maxCapacity: number;
  furnishingLevel?: string;
  amenities?: string[];
  amenitiesMask?: number;
  amenityIds?: number[];
  serviceIds?: (number | string)[];
  description?: string;
  status?: RoomStatus;
  isPublic?: boolean;
  province?: string;
  ward?: string;
  provinceId?: number;
  wardId?: number;
  addressDetail?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> { }

export interface RoomFilterParams extends PagingParams {
  buildingId?: number | string;
  floor?: number;
  status?: RoomStatus | 'ALL';
  keyword?: string;
  provinceId?: number;
  wardId?: number;
  amenitiesMask?: number;
}

// =========================================================================
// 3. Dịch vụ tiện ích (UC 09 - 12)
// =========================================================================
export type ServiceCategory =
  | 'ELECTRICITY'
  | 'WATER'
  | 'INTERNET'
  | 'CLEANING'
  | 'PARKING'
  | 'ELEVATOR'
  | 'OTHER';

export type BillingMethod =
  | 'METER_INDEX'
  | 'FIXED_PER_ROOM'
  | 'FIXED_PER_PERSON'
  | 'FIXED_PER_UNIT';

// --- 3.A. RESPONSE OBJECTS (Backend trả về) ---
export interface UtilityService {
  id: number | string;
  name: string;
  category: ServiceCategory | string;
  unit: string;
  unitPrice: number;
  billingMethod: BillingMethod;
  scope?: string;
  isActive: boolean;
  createdAt?: string;
}

// --- 3.B. REQUEST OBJECTS (Frontend gửi lên) ---
export interface CreateServiceDto {
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  billingMethod: BillingMethod;
  scope?: string;
  isActive?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> { }

// =========================================================================
// 4. Khách thuê (UC 13 - 17)
// =========================================================================
export type TenantRoleInRoom = 'REPRESENTATIVE' | 'MEMBER';
export type TenantLinkStatus = 'NOT_LINKED' | 'PENDING' | 'LINKED' | 'UNLINKED';

// --- 4.A. RESPONSE OBJECTS (Backend trả về) ---
export interface Tenant {
  id: number | string;
  roomId?: number | string;
  roomName?: string;
  buildingName?: string;
  contractId?: number | string;
  userId?: number | string;
  userEmail?: string;
  fullName: string;
  phone: string;
  idCardNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  hometown?: string;
  idCardPhotoFront?: string;
  idCardPhotoBack?: string;
  isRepresentative?: boolean;
  linkStatus: TenantLinkStatus;
  createdAt?: string;
}

// --- 4.B. REQUEST OBJECTS (Frontend gửi lên) ---
export interface CreateTenantDto {
  fullName: string;
  phone: string;
  idCardNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  hometown?: string;
  idCardPhotoFront?: string;
  idCardPhotoBack?: string;
  isRepresentative?: boolean;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> { }

export interface TenantFilterParams extends PagingParams {
  keyword?: string;
  buildingId?: number | string;
  roomId?: number | string;
  linkStatus?: TenantLinkStatus | 'ALL';
}

// =========================================================================
// 5. Hợp đồng thuê phòng (UC 18 - 21)
// =========================================================================
export type ContractStatus = 'ACTIVE' | 'TERMINATED';

// --- 5.A. RESPONSE OBJECTS (Backend trả về) ---
export interface ContractServiceItem {
  id?: number | string;
  serviceId?: number | string;
  serviceName: string;
  unit: string;
  appliedUnitPrice: number;
  billingMethod: string;
  lastIndex?: number;
}

export interface RentalContract {
  id: number | string;
  roomId: number | string;
  roomName?: string;
  buildingName?: string;
  representativeTenantId?: number | string;
  representativeTenantName?: string;
  representativeTenantPhone?: string;
  startDate: string;
  durationMonths?: number;
  endDate: string;
  rentPrice: number;
  depositAmount: number;
  paymentCycleDay?: number;
  depositRefundAmount?: number;
  status: ContractStatus;
  pdfFileUrl?: string;
  termsAndConditions?: string;
  services?: ContractServiceItem[];
  serviceIds?: (number | string)[];
  tenants?: Tenant[];
  createdAt?: string;
}

export interface TerminateContractResult {
  initialDeposit: number;
  totalUtilityCost?: number;
  settlements?: {
    contractServiceId: number;
    serviceName: string;
    unit: string;
    startIndex: number;
    endIndex: number;
    consumed: number;
    unitPrice: number;
    amount: number;
  }[];
  damageCost?: number;
  damageNote?: string;
  netRefundAmount?: number;
}

// --- 5.B. REQUEST OBJECTS (Frontend gửi lên) ---
export interface CreateContractServiceRequestItem {
  serviceId: number | string;
  initialIndex?: number;
}

export interface CreateContractDto {
  roomId: number | string;
  representativeTenantId: number | string;
  tenantIds?: (number | string)[];
  startDate: string;
  durationMonths?: number;
  endDate?: string;
  rentPrice: number;
  depositAmount: number;
  paymentCycleDay?: number;
  termsAndConditions?: string;
  services?: CreateContractServiceRequestItem[];
}

export interface UpdateContractDto {
  endDate?: string;
  rentPrice?: number;
  paymentCycleDay?: number;
  termsAndConditions?: string;
}

export interface TerminateContractDto {
  meterReadings?: {
    contractServiceId: number;
    finalIndex: number;
  }[];
  damageCost?: number;
  damageNote?: string;
}

export interface ContractFilterParams extends PagingParams {
  buildingId?: number | string;
  status?: ContractStatus | 'ALL';
  keyword?: string;
}

// =========================================================================
// 6. Hóa đơn & Thu tiền (UC 22 - 26) - Khớp 100% Backend Spring Boot
// =========================================================================
export type InvoiceStatus =
  | 'DRAFT'
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type InvoiceItemType = 'ROOM_RENT' | 'SERVICE' | 'SURCHARGE' | 'DISCOUNT';

// --- 6.A. RESPONSE OBJECTS (Dữ liệu do Backend trả về cho Frontend) ---

/** Chi tiết một dòng chi phí trong hóa đơn do Backend trả về */
export interface InvoiceItemResponse {
  id?: number | string;
  contractServiceId?: number | string;
  itemType?: InvoiceItemType;
  itemName: string;
  previousIndex?: number;
  currentIndex?: number;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  note?: string;
}

/** Dữ liệu hóa đơn hoàn chỉnh do Backend trả về (Khớp InvoiceResponse.java) */
export interface InvoiceResponse {
  id: number | string;
  contractId?: number | string;
  roomId?: number | string;
  roomName?: string;
  buildingName?: string;
  representativeTenantName?: string;
  representativeTenantPhone?: string;
  billingPeriod: string;
  dueDate: string;
  roomPrice?: number;
  servicesAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  paidAt?: string;
  cancelReason?: string;
  paymentNote?: string;
  items?: InvoiceItemResponse[];
  createdAt?: string;
}

// --- 6.B. REQUEST OBJECTS (Dữ liệu Frontend đóng gói gửi lên Backend) ---

/** Request item chỉ số / số lượng dịch vụ gửi lên khi lập hoặc sửa hóa đơn.
 * Server CHỈ ĐỌC currentIndex (dịch vụ METER_INDEX) hoặc quantity (dịch vụ FIXED_PER_UNIT).
 * Tên dịch vụ, đơn giá, chỉ số cũ, thành tiền do Server tự lấy từ hợp đồng và tính toán.
 */
export interface InvoiceItemRequest {
  contractServiceId: number;
  currentIndex?: number;
  quantity?: number;
}

/** Request dòng phụ thu / giảm trừ phát sinh gửi lên khi lập hoặc sửa hóa đơn */
export interface InvoiceAdjustmentRequest {
  type: 'SURCHARGE' | 'DISCOUNT';
  reason: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  unit?: string;
  note?: string;
}

/** Request lập mới hóa đơn gửi lên POST /api/v1/landlord/invoices (Khớp CreateInvoiceRequest.java) */
export interface CreateInvoiceRequest {
  contractId: number;
  billingPeriod: string;
  dueDate?: string;
  isDraft?: boolean;
  items?: InvoiceItemRequest[];
  adjustments?: InvoiceAdjustmentRequest[];
}

/** Request cập nhật hóa đơn gửi lên PUT /api/v1/landlord/invoices/{id} (Khớp InvoiceUpdateRequest.java) */
export interface UpdateInvoiceRequest {
  dueDate?: string;
  items?: InvoiceItemRequest[];
  adjustments?: InvoiceAdjustmentRequest[];
}

/** Request xác nhận thanh toán gửi lên POST /api/v1/landlord/invoices/{id}/payment (Khớp InvoicePaymentRequest.java) */
export interface InvoicePaymentRequest {
  paymentAmount: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'VIETQR' | string;
  paymentNote?: string;
}

/** Request hủy hóa đơn gửi lên POST /api/v1/landlord/invoices/{id}/cancel (Khớp InvoiceCancelRequest.java) */
export interface InvoiceCancelRequest {
  cancelReason: string;
}

/** Tham số bộ lọc tìm kiếm danh sách hóa đơn GET /api/v1/landlord/invoices */
export interface InvoiceFilterParams extends PagingParams {
  billingPeriod?: string;
  buildingId?: number | string;
  status?: InvoiceStatus | 'ALL';
  keyword?: string;
}

// =========================================================================
// 7. Khiếu nại & Báo hỏng (UC 27 - 28)
// =========================================================================
export type ComplaintUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ComplaintStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'RESOLVED'
  | 'REJECTED';

// --- 7.A. RESPONSE OBJECTS (Backend trả về) ---
export interface Complaint {
  id: number | string;
  roomId?: number | string;
  roomName?: string;
  buildingName?: string;
  tenantId?: number | string;
  tenantName?: string;
  tenantPhone?: string;
  title: string;
  content: string;
  incidentType: string;
  severity: ComplaintUrgency | string;
  images?: string;
  status: ComplaintStatus;
  resolutionNote?: string;
  resolvedAt?: string;
  rating?: number;
  feedback?: string;
  createdAt?: string;
}

// --- 7.B. REQUEST OBJECTS (Frontend gửi lên) ---
export interface UpdateComplaintProgressDto {
  status: 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  resolutionNote: string;
}

export interface ComplaintFilterParams extends PagingParams {
  status?: ComplaintStatus | 'ALL';
  buildingId?: number | string;
  type?: string | 'ALL';
  keyword?: string;
}

// =========================================================================
// 8. Dashboard Chủ trọ (UC 29)
// =========================================================================

// --- 8.A. RESPONSE OBJECTS (Backend trả về) ---
export interface RevenueTrendItem {
  month: string;
  revenue: number;
}

export interface OverdueDebtItem {
  roomName: string;
  buildingName: string;
  tenantName: string;
  phone: string;
  debtAmount: number;
  daysLate: number;
}

export interface LandlordDashboardData {
  monthlyRevenue: number;
  occupancyRate: number;
  totalBuildings?: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms?: number;
  activeTenants?: number;
  unpaidInvoicesCount?: number;
  pendingComplaintsCount: number;
  revenueTrend?: RevenueTrendItem[];
  overdueDebts?: OverdueDebtItem[];
}
