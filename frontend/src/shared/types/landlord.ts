/**
 * Định nghĩa kiểu dữ liệu cho Role: Chủ trọ (Landlord) - Đồng bộ 100% với Backend Spring Boot & Database
 * Tuyệt đối không chứa các trường alias legacy hoặc các trường mã không tồn tại trong DB.
 */

// =========================================================================
// 1. Tòa nhà / Khu trọ (UC 01 - 04)
// =========================================================================
export interface Building {
  id: number | string;
  name: string;
  province?: string;
  ward?: string;
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

export interface CreateBuildingDto {
  name: string;
  province?: string;
  ward?: string;
  addressDetail?: string;
  numFloors?: number;
  generalRules?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateBuildingDto extends Partial<CreateBuildingDto> {}

export interface BuildingFilterParams {
  keyword?: string;
  floors?: number;
  page?: number;
  size?: number;
}

// =========================================================================
// 2. Phòng trọ (UC 05 - 08)
// =========================================================================
export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'UNDER_MAINTENANCE'
  | 'STOPPED'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'DISABLED';

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
  amenities?: string[] | string;
  serviceIds?: number[];
  services?: any[];
  description?: string;
  status: RoomStatus;
  province?: string;
  ward?: string;
  addressDetail?: string;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
  isPublic?: boolean;
  createdAt?: string;
}

export interface CreateRoomDto {
  buildingId?: number | string | null;
  name: string;
  floor?: number;
  area: number;
  listedPrice: number;
  standardDeposit: number;
  maxCapacity: number;
  furnishingLevel?: string;
  amenities?: string[] | string;
  serviceIds?: (number | string)[];
  description?: string;
  status?: RoomStatus;
  isPublic?: boolean;
  province?: string;
  ward?: string;
  addressDetail?: string;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}

export interface RoomFilterParams {
  buildingId?: number | string;
  floor?: number;
  status?: RoomStatus | 'ALL';
  keyword?: string;
  page?: number;
  size?: number;
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

export interface UtilityService {
  id: number | string;
  name: string;
  category: ServiceCategory | string;
  unit: string;
  unitPrice: number;
  billingMethod: string;
  scope?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateServiceDto {
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  billingMethod: string;
  scope?: string;
  isActive?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

// =========================================================================
// 4. Khách thuê (UC 13 - 17)
// =========================================================================
export type TenantRoleInRoom = 'REPRESENTATIVE' | 'MEMBER';
export type TenantLinkStatus = 'NOT_LINKED' | 'PENDING' | 'LINKED' | 'UNLINKED';

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
  status: 'STAYING' | 'LEFT' | 'RENTING' | 'CHECKED_OUT';
  createdAt?: string;
}

export interface CreateTenantDto {
  roomId: number | string;
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

export interface UpdateTenantDto extends Partial<CreateTenantDto> {}

export interface TenantFilterParams {
  keyword?: string;
  buildingId?: number | string;
  roomId?: number | string;
  linkStatus?: TenantLinkStatus | 'ALL';
  page?: number;
  size?: number;
}

// =========================================================================
// 5. Hợp đồng thuê phòng (UC 18 - 21)
// =========================================================================
export type ContractStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'TERMINATED' | 'CANCELLED';

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

export interface CreateContractDto {
  roomId: number | string;
  representativeTenantId: number | string;
  startDate: string;
  durationMonths?: number;
  endDate?: string;
  rentPrice: number;
  depositAmount: number;
  paymentCycleDay?: number;
  termsAndConditions?: string;
  serviceIds?: (number | string)[];
  services?: {
    serviceId?: number | string;
    serviceName: string;
    unit: string;
    appliedUnitPrice: number;
    billingMethod: string;
    initialIndex?: number;
  }[];
}

export interface UpdateContractDto {
  endDate?: string;
  rentPrice?: number;
  paymentCycleDay?: number;
  termsAndConditions?: string;
}

export interface TerminateContractDto {
  finalElectricIndex?: number;
  finalWaterIndex?: number;
  damageCost?: number;
  damageNote?: string;
}

export interface TerminateContractResult {
  initialDeposit: number;
  electricConsumed?: number;
  electricAmount?: number;
  waterConsumed?: number;
  waterAmount?: number;
  totalUtilityCost?: number;
  damageCost?: number;
  damageNote?: string;
  netRefundAmount?: number;
}

export interface ContractFilterParams {
  buildingId?: number | string;
  status?: ContractStatus | 'ALL';
  keyword?: string;
  page?: number;
  size?: number;
}

// =========================================================================
// 6. Hóa đơn & Thu tiền (UC 22 - 26)
// =========================================================================
export type BillStatus =
  | 'DRAFT'
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'PENDING'
  | 'PARTIAL';

export type InvoiceItemType = 'ROOM_RENT' | 'SERVICE' | 'SURCHARGE' | 'DISCOUNT';

export interface BillItem {
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

export interface Bill {
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
  otherAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  status: BillStatus;
  paymentMethod?: string;
  paidAt?: string;
  cancelReason?: string;
  paymentNote?: string;
  items?: BillItem[];
  createdAt?: string;
}

export interface CreateBillDto {
  contractId?: number | string;
  roomId?: number | string;
  billingPeriod: string;
  dueDate?: string;
  otherAmount?: number;
  otherNote?: string;
  isDraft?: boolean;
  items?: {
    contractServiceId?: number | string;
    itemType?: InvoiceItemType;
    itemName: string;
    billingMethod?: string;
    previousIndex?: number;
    currentIndex?: number;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    note?: string;
  }[];
}

export interface UpdateBillDto {
  dueDate?: string;
  otherAmount?: number;
  otherNote?: string;
  items?: CreateBillDto['items'];
}

export interface ConfirmPaymentDto {
  paymentAmount: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'VIETQR' | string;
  paymentNote?: string;
}

export interface BillFilterParams {
  billingPeriod?: string;
  buildingId?: number | string;
  status?: BillStatus | 'ALL';
  page?: number;
  size?: number;
}

// =========================================================================
// 7. Khiếu nại & Báo hỏng (UC 27 - 28)
// =========================================================================
export type ComplaintUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ComplaintStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'RESOLVED'
  | 'REJECTED'
  | 'NEW';

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

export interface UpdateComplaintProgressDto {
  status: 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  resolutionNote: string;
}

export interface ComplaintFilterParams {
  status?: ComplaintStatus | 'ALL';
  buildingId?: number | string;
  type?: string | 'ALL';
  page?: number;
  size?: number;
}

// =========================================================================
// 8. Dashboard Chủ trọ (UC 29)
// =========================================================================
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
