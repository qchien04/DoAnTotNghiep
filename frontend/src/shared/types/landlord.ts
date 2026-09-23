/**
 * Định nghĩa kiểu dữ liệu cho Role: Chủ trọ (Landlord) - Đồng bộ 100% với Backend Spring Boot
 */

// =========================================================================
// 1. Tòa nhà / Khu trọ (UC 01 - 04)
// =========================================================================
export interface Building {
  id: number | string;
  buildingCode?: string;
  name: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
  numFloors?: number;
  generalRules?: string;
  commonAmenities?: string[] | string;
  serviceIds?: (number | string)[];
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  totalRooms?: number;
  occupiedRooms?: number;
  availableRooms?: number;
  createdAt?: string;

  // Aliases for compatibility
  code?: string;
  address?: string;
  totalFloors?: number;
  amenities?: string[] | string;
  rules?: string;
}

export interface CreateBuildingDto {
  buildingCode?: string;
  name: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
  numFloors?: number;
  generalRules?: string;
  commonAmenities?: string[] | string;
  serviceIds?: (number | string)[];
  latitude?: number;
  longitude?: number;

  // Aliases
  code?: string;
  address?: string;
  totalFloors?: number;
  amenities?: string[] | string;
  rules?: string;
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
  buildingId: number | string;
  buildingName?: string;
  buildingCode?: string;
  roomCode?: string;
  name: string;
  floor: number;
  area: number;
  listedPrice?: number;
  standardDeposit?: number;
  maxCapacity?: number;
  currentOccupancy?: number;
  furnishingLevel?: string;
  amenities?: string[] | string;
  serviceIds?: number[];
  services?: any[];
  description?: string;
  status: RoomStatus;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
  createdAt?: string;

  // Aliases for compatibility
  code?: string;
  price?: number;
  deposit?: number;
  capacity?: number;
  currentTenantsCount?: number;
}

export interface CreateRoomDto {
  buildingId: number | string;
  roomCode?: string;
  name: string;
  floor: number;
  area: number;
  listedPrice?: number;
  standardDeposit?: number;
  maxCapacity?: number;
  furnishingLevel?: string;
  amenities?: string[] | string;
  serviceIds?: (number | string)[];
  description?: string;
  status?: RoomStatus;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;

  // Aliases
  code?: string;
  price?: number;
  deposit?: number;
  capacity?: number;
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

export type ServiceChargingType =
  | 'METER_INDEX'
  | 'FIXED_PER_ROOM'
  | 'FIXED_PER_PERSON'
  | 'FIXED_PER_UNIT'
  | 'METER'
  | 'PER_ROOM'
  | 'PER_PERSON';

export interface UtilityService {
  id: number | string;
  serviceCode?: string;
  name: string;
  category: ServiceCategory | string;
  unit: string;
  unitPrice: number;
  billingMethod: string;
  scope?: string;
  isActive: boolean;
  createdAt?: string;

  // Aliases
  code?: string;
  price?: number;
  chargingType?: ServiceChargingType;
  appliedScope?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
}

export interface CreateServiceDto {
  serviceCode?: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  billingMethod: string;
  scope?: string;
  isActive?: boolean;

  // Aliases
  code?: string;
  price?: number;
  chargingType?: ServiceChargingType;
  appliedScope?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

// =========================================================================
// 4. Khách thuê (UC 13 - 17)
// =========================================================================
export type TenantRoleInRoom = 'REPRESENTATIVE' | 'MEMBER';
export type TenantLinkStatus = 'NOT_LINKED' | 'PENDING' | 'LINKED' | 'UNLINKED';

export interface Tenant {
  id: number | string;
  tenantCode?: string;
  roomId?: number | string;
  roomCode?: string;
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

  // Aliases
  code?: string;
  identityCard?: string;
  birthDate?: string;
  buildingId?: number | string;
  roomName?: string;
  roleInRoom?: TenantRoleInRoom;
  linkedUserId?: number | string;
  linkedUserName?: string;
  idCardFrontImage?: string;
  idCardBackImage?: string;
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

  // Aliases
  buildingId?: number | string;
  identityCard?: string;
  birthDate?: string;
  roleInRoom?: TenantRoleInRoom;
  idCardFrontImage?: string;
  idCardBackImage?: string;
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
  contractCode?: string;
  roomId: number | string;
  roomCode?: string;
  buildingName?: string;
  representativeTenantId?: number | string;
  representativeTenantName?: string;
  representativeTenantPhone?: string;
  startDate: string;
  endDate: string;
  rentPrice?: number;
  depositAmount: number;
  paymentCycleDay?: number;
  initialElectricIndex?: number;
  initialWaterIndex?: number;
  finalElectricIndex?: number;
  finalWaterIndex?: number;
  depositRefundAmount?: number;
  status: ContractStatus;
  pdfFileUrl?: string;
  termsAndConditions?: string;
  services?: ContractServiceItem[];
  createdAt?: string;

  // Aliases
  contractNumber?: string;
  buildingId?: number | string;
  roomName?: string;
  tenantId?: number | string;
  tenantName?: string;
  tenantPhone?: string;
  durationMonths?: number;
  monthlyRent?: number;
  initialElectricityReading?: number;
  initialWaterReading?: number;
  includedServices?: string[];
  termsNote?: string;
}

export interface CreateContractDto {
  roomId: number | string;
  representativeTenantId?: number | string;
  contractCode?: string;
  startDate: string;
  durationMonths?: number;
  endDate?: string;
  rentPrice?: number;
  depositAmount: number;
  paymentCycleDay?: number;
  initialElectricIndex?: number;
  initialWaterIndex?: number;
  termsAndConditions?: string;
  serviceIds?: (number | string)[];
  services?: {
    serviceId?: number | string;
    serviceName: string;
    unit: string;
    appliedUnitPrice: number;
    billingMethod: string;
  }[];

  // Aliases
  contractNumber?: string;
  buildingId?: number | string;
  tenantId?: number | string;
  monthlyRent?: number;
  initialElectricityReading?: number;
  initialWaterReading?: number;
  includedServices?: string[];
  termsNote?: string;
}

export interface UpdateContractDto {
  endDate?: string;
  rentPrice?: number;
  paymentCycleDay?: number;
  termsAndConditions?: string;

  // Aliases
  monthlyRent?: number;
  includedServices?: string[];
  termsNote?: string;
}

export interface TerminateContractDto {
  finalElectricIndex?: number;
  finalWaterIndex?: number;
  damageCost?: number;
  damageNote?: string;

  // Aliases
  finalElectricityReading?: number;
  finalWaterReading?: number;
  damageDeductions?: {
    description: string;
    amount: number;
  }[];
  note?: string;
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

  // Aliases
  contractNumber?: string;
  finalUtilityCost?: number;
  totalDamagesCost?: number;
  refundAmount?: number;
  settlementDate?: string;
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
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'PENDING'
  | 'PARTIAL';

export interface BillItem {
  id?: number | string;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  note?: string;

  // Aliases
  name?: string;
  unit?: string;
  totalPrice?: number;
}

export interface Bill {
  id: number | string;
  invoiceCode?: string;
  contractId?: number | string;
  contractCode?: string;
  roomId?: number | string;
  roomCode?: string;
  buildingName?: string;
  representativeTenantName?: string;
  representativeTenantPhone?: string;
  billingPeriod?: string;
  dueDate: string;
  roomPrice?: number;
  servicesAmount?: number;
  otherAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  previousElectricIndex?: number;
  currentElectricIndex?: number;
  electricConsumed?: number;
  previousWaterIndex?: number;
  currentWaterIndex?: number;
  waterConsumed?: number;
  status: BillStatus;
  paymentMethod?: string;
  paidAt?: string;
  cancelReason?: string;
  items?: BillItem[];
  createdAt?: string;

  // Aliases
  billNumber?: string;
  buildingId?: number | string;
  roomName?: string;
  tenantName?: string;
  billingMonth?: string;
  oldElectricity?: number;
  newElectricity?: number;
  electricityUsage?: number;
  oldWater?: number;
  newWater?: number;
  waterUsage?: number;
  roomRent?: number;
  paymentDate?: string;
  paymentNote?: string;
  cancellationReason?: string;
}

export interface CreateBillDto {
  contractId?: number | string;
  billingPeriod?: string;
  dueDate?: string;
  currentElectricIndex?: number;
  currentWaterIndex?: number;
  otherAmount?: number;
  otherNote?: string;
  items?: {
    contractServiceId?: number | string;
    itemName: string;
    billingMethod?: string;
    previousIndex?: number;
    currentIndex?: number;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    note?: string;
  }[];

  // Aliases
  buildingId?: number | string;
  roomId?: number | string;
  billingMonth?: string;
  newElectricity?: number;
  newWater?: number;
  additionalItems?: { name: string; amount: number }[];
}

export interface UpdateBillDto {
  dueDate?: string;
  currentElectricIndex?: number;
  currentWaterIndex?: number;
  otherAmount?: number;
  otherNote?: string;

  // Aliases
  newElectricity?: number;
  newWater?: number;
  additionalItems?: { name: string; amount: number }[];
}

export interface ConfirmPaymentDto {
  paymentAmount?: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'VIETQR' | string;
  paymentNote?: string;

  // Aliases
  amount?: number;
  paymentDate?: string;
  note?: string;
}

export interface BillFilterParams {
  billingPeriod?: string;
  buildingId?: number | string;
  status?: BillStatus | 'ALL';
  page?: number;
  size?: number;

  // Aliases
  billingMonth?: string;
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
  complaintCode?: string;
  roomId?: number | string;
  roomCode?: string;
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
  createdAt?: string;

  // Aliases
  code?: string;
  buildingId?: number | string;
  roomName?: string;
  senderName?: string;
  senderPhone?: string;
  type?: string;
  urgency?: ComplaintUrgency;
  responseNote?: string;
  rating?: number;
  ratingFeedback?: string;
  updatedAt?: string;
}

export interface UpdateComplaintProgressDto {
  status: 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  resolutionNote: string;

  // Aliases
  responseNote?: string;
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

  // Aliases
  totalDebt?: number;
  overdueDebts?: OverdueDebtItem[];
  revenueTrend?: { month: string; revenue: number }[];
}
