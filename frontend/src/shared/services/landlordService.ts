import apiClient from './api';
import { ResponseData } from '@/shared/types/api';
import { resolveServiceUnit } from '@/shared/utils/serviceUtils';
import {
  Building,
  CreateBuildingDto,
  UpdateBuildingDto,
  BuildingFilterParams,
  Room,
  CreateRoomDto,
  UpdateRoomDto,
  RoomFilterParams,
  UtilityService,
  CreateServiceDto,
  UpdateServiceDto,
  Tenant,
  CreateTenantDto,
  UpdateTenantDto,
  TenantFilterParams,
  RentalContract,
  CreateContractDto,
  UpdateContractDto,
  TerminateContractDto,
  TerminateContractResult,
  ContractFilterParams,
  Bill,
  CreateBillDto,
  UpdateBillDto,
  ConfirmPaymentDto,
  BillFilterParams,
  Complaint,
  UpdateComplaintProgressDto,
  ComplaintFilterParams,
  LandlordDashboardData,
} from '@/shared/types/landlord';

const normalizeBuilding = (b: any): Building => ({
  id: b.id,
  name: b.name,
  province: b.province,
  ward: b.ward,
  addressDetail: b.addressDetail,
  numFloors: b.numFloors !== undefined ? b.numFloors : 1,
  generalRules: b.generalRules,
  latitude: b.latitude !== undefined && b.latitude !== null ? Number(b.latitude) : undefined,
  longitude: b.longitude !== undefined && b.longitude !== null ? Number(b.longitude) : undefined,
  isActive: b.isActive !== undefined ? Boolean(b.isActive) : true,
  totalRooms: b.totalRooms ?? 0,
  occupiedRooms: b.occupiedRooms ?? 0,
  availableRooms: b.availableRooms ?? 0,
  createdAt: b.createdAt,
});

const normalizeRoom = (r: any): Room => ({
  id: r.id,
  buildingId: r.buildingId ?? null,
  buildingName: r.buildingName,
  name: r.name,
  floor: r.floor ?? 1,
  area: Number(r.area ?? 0),
  listedPrice: Number(r.listedPrice ?? 0),
  standardDeposit: Number(r.standardDeposit ?? 0),
  maxCapacity: Number(r.maxCapacity ?? 1),
  currentOccupancy: Number(r.currentOccupancy ?? 0),
  furnishingLevel: r.furnishingLevel || 'BASIC',
  amenities: Array.isArray(r.amenities)
    ? r.amenities
    : typeof r.amenities === 'string' && r.amenities.trim()
    ? r.amenities.split(',').map((s: string) => s.trim())
    : [],
  serviceIds: Array.isArray(r.serviceIds) ? r.serviceIds.map(Number) : [],
  services: r.services || [],
  description: r.description || '',
  status: r.status || 'AVAILABLE',
  province: r.province,
  ward: r.ward,
  addressDetail: r.addressDetail,
  imageUrls: Array.isArray(r.imageUrls) ? r.imageUrls : [],
  latitude: r.latitude !== undefined && r.latitude !== null ? Number(r.latitude) : undefined,
  longitude: r.longitude !== undefined && r.longitude !== null ? Number(r.longitude) : undefined,
  isPublic: r.isPublic !== undefined ? Boolean(r.isPublic) : true,
  createdAt: r.createdAt,
});

const calculateMonthsBetween = (startDate?: string, endDate?: string): number => {
  if (!startDate || !endDate) return 12;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.round(diffDays / 30);
  return Math.max(1, months);
};

const normalizeContract = (c: any): RentalContract => {
  if (!c) return c;
  const months = c.durationMonths || calculateMonthsBetween(c.startDate, c.endDate);

  return {
    id: c.id,
    roomId: c.roomId,
    roomName: c.roomName || (c.roomId ? `Phòng #${c.roomId}` : 'Phòng trọ'),
    buildingName: c.buildingName || '',
    representativeTenantId: c.representativeTenantId,
    representativeTenantName: c.representativeTenantName || '---',
    representativeTenantPhone: c.representativeTenantPhone || '',
    startDate: c.startDate,
    durationMonths: months,
    endDate: c.endDate,
    rentPrice: Number(c.rentPrice ?? 0),
    depositAmount: Number(c.depositAmount ?? 0),
    paymentCycleDay: c.paymentCycleDay ?? 5,
    depositRefundAmount: c.depositRefundAmount,
    status: c.status || 'ACTIVE',
    pdfFileUrl: c.pdfFileUrl,
    termsAndConditions: c.termsAndConditions || '',
    services: c.services || [],
    serviceIds: c.serviceIds ? c.serviceIds.map(Number) : [],
    tenants: c.tenants || [],
    createdAt: c.createdAt,
  };
};

const normalizeService = (s: any): UtilityService => {
  if (!s) return s;
  const isAct = s.isActive !== undefined ? Boolean(s.isActive) : true;
  const uPrice = Number(s.unitPrice ?? 0);
  const bMethod = s.billingMethod || 'FIXED_PER_ROOM';

  return {
    id: s.id,
    name: s.name || '',
    category: s.category || 'OTHER',
    unit: resolveServiceUnit({
      ...s,
      billingMethod: bMethod,
      chargingType: bMethod,
    }),
    unitPrice: uPrice,
    billingMethod: bMethod,
    scope: s.scope || 'ALL',
    isActive: isAct,
    createdAt: s.createdAt,
  };
};

const normalizeTenant = (t: any): Tenant => {
  if (!t) return t;

  return {
    id: t.id,
    roomId: t.roomId,
    roomName: t.roomName || (t.roomId ? `Phòng #${t.roomId}` : 'Phòng trọ'),
    buildingName: t.buildingName || '',
    contractId: t.contractId,
    userId: t.userId,
    userEmail: t.userEmail,
    fullName: t.fullName || '',
    phone: t.phone || '',
    idCardNumber: t.idCardNumber || '',
    gender: t.gender || '',
    dateOfBirth: t.dateOfBirth,
    hometown: t.hometown || '',
    idCardPhotoFront: t.idCardPhotoFront,
    idCardPhotoBack: t.idCardPhotoBack,
    isRepresentative: Boolean(t.isRepresentative),
    linkStatus: t.linkStatus || 'NOT_LINKED',
    status: t.status || 'STAYING',
    createdAt: t.createdAt,
  };
};

const normalizeBill = (b: any): Bill => {
  if (!b) return b;
  const tot = Number(b.totalAmount || 0);
  const paid = Number(b.paidAmount || 0);
  const rem = b.remainingAmount !== undefined ? Number(b.remainingAmount) : Math.max(0, tot - paid);

  return {
    id: b.id,
    contractId: b.contractId,
    roomId: b.roomId,
    roomName: b.roomName || '---',
    buildingName: b.buildingName,
    representativeTenantName: b.representativeTenantName || '---',
    representativeTenantPhone: b.representativeTenantPhone || '',
    billingPeriod: b.billingPeriod || '',
    dueDate: b.dueDate,
    roomPrice: b.roomPrice,
    servicesAmount: b.servicesAmount,
    otherAmount: b.otherAmount,
    totalAmount: tot,
    paidAmount: paid,
    remainingAmount: rem,
    status: b.status,
    paymentMethod: b.paymentMethod,
    paidAt: b.paidAt,
    cancelReason: b.cancelReason,
    paymentNote: b.paymentNote,
    items: (b.items || []).map((it: any) => ({
      id: it.id,
      contractServiceId: it.contractServiceId,
      itemName: it.itemName,
      previousIndex: it.previousIndex,
      currentIndex: it.currentIndex,
      quantity: Number(it.quantity ?? 1),
      unitPrice: Number(it.unitPrice ?? 0),
      amount: Number(it.amount ?? 0),
      note: it.note,
    })),
    createdAt: b.createdAt,
  };
};

const normalizeComplaint = (c: any): Complaint => {
  if (!c) return c;

  return {
    id: c.id,
    roomId: c.roomId,
    roomName: c.roomName || '---',
    buildingName: c.buildingName,
    tenantId: c.tenantId,
    tenantName: c.tenantName || '---',
    tenantPhone: c.tenantPhone || '',
    title: c.title || '',
    content: c.content || '',
    incidentType: c.incidentType || 'OTHER',
    severity: c.severity || 'MEDIUM',
    images: c.images,
    status: c.status || 'PENDING',
    resolutionNote: c.resolutionNote,
    resolvedAt: c.resolvedAt,
    rating: c.rating,
    feedback: c.feedback,
    createdAt: c.createdAt,
  };
};

export const landlordService = {
  // 1. Tòa nhà (UC 01 - 04)
  getBuildings: async (params?: BuildingFilterParams): Promise<ResponseData<Building[]>> => {
    const res = await apiClient.get<ResponseData<Building[]>>('/api/v1/landlord/buildings', {
      params: {
        keyword: params?.keyword,
        floors: params?.floors,
      },
    });
    if (res.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeBuilding);
    }
    return res.data;
  },

  getBuildingById: async (id: string | number): Promise<ResponseData<Building>> => {
    const res = await apiClient.get<ResponseData<Building>>(`/api/v1/landlord/buildings/${id}`);
    if (res.data?.data) {
      res.data.data = normalizeBuilding(res.data.data);
    }
    return res.data;
  },

  createBuilding: async (dto: CreateBuildingDto): Promise<ResponseData<Building>> => {
    const payload = {
      name: dto.name,
      province: dto.province,
      ward: dto.ward,
      addressDetail: dto.addressDetail || '',
      numFloors: Number(dto.numFloors || 1),
      generalRules: dto.generalRules,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
    const res = await apiClient.post<ResponseData<Building>>('/api/v1/landlord/buildings', payload);
    if (res.data?.data) {
      res.data.data = normalizeBuilding(res.data.data);
    }
    return res.data;
  },

  updateBuilding: async (id: string | number, dto: UpdateBuildingDto): Promise<ResponseData<Building>> => {
    const payload = {
      name: dto.name,
      province: dto.province,
      ward: dto.ward,
      addressDetail: dto.addressDetail,
      numFloors: dto.numFloors ? Number(dto.numFloors) : undefined,
      generalRules: dto.generalRules,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
    const res = await apiClient.put<ResponseData<Building>>(`/api/v1/landlord/buildings/${id}`, payload);
    if (res.data?.data) {
      res.data.data = normalizeBuilding(res.data.data);
    }
    return res.data;
  },

  deleteBuilding: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/buildings/${id}`);
    return res.data;
  },

  // 2. Phòng trọ (UC 05 - 08)
  getRooms: async (params?: RoomFilterParams): Promise<ResponseData<Room[]>> => {
    let st = params?.status === 'ALL' ? undefined : params?.status;
    if (st === 'RENTED') st = 'OCCUPIED';
    if (st === 'MAINTENANCE') st = 'UNDER_MAINTENANCE';
    if (st === 'DISABLED') st = 'STOPPED';

    const res = await apiClient.get<ResponseData<Room[]>>('/api/v1/landlord/rooms', {
      params: {
        buildingId: params?.buildingId,
        status: st,
        floor: params?.floor,
        search: params?.keyword,
      },
    });
    if (res.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeRoom);
    }
    return res.data;
  },

  getRoomById: async (id: string | number): Promise<ResponseData<Room>> => {
    const res = await apiClient.get<ResponseData<Room>>(`/api/v1/landlord/rooms/${id}`);
    if (res.data?.data) {
      res.data.data = normalizeRoom(res.data.data);
    }
    return res.data;
  },

  createRoom: async (dto: CreateRoomDto): Promise<ResponseData<Room>> => {
    const payload = {
      buildingId: dto.buildingId !== undefined && dto.buildingId !== null ? Number(dto.buildingId) : null,
      name: dto.name,
      floor: Number(dto.floor || 1),
      area: Number(dto.area || 20),
      listedPrice: Number(dto.listedPrice ?? 0),
      standardDeposit: Number(dto.standardDeposit ?? 0),
      maxCapacity: Number(dto.maxCapacity ?? 2),
      furnishingLevel: dto.furnishingLevel || 'BASIC',
      amenities: Array.isArray(dto.amenities)
        ? dto.amenities
        : (dto.amenities ? [dto.amenities] : []),
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : [],
      description: dto.description || '',
      status: dto.status || 'AVAILABLE',
      isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
      province: dto.province,
      ward: dto.ward,
      addressDetail: dto.addressDetail,
      imageUrls: dto.imageUrls || [],
      latitude: dto.latitude !== undefined && dto.latitude !== null ? Number(dto.latitude) : undefined,
      longitude: dto.longitude !== undefined && dto.longitude !== null ? Number(dto.longitude) : undefined,
    };
    const res = await apiClient.post<ResponseData<Room>>('/api/v1/landlord/rooms', payload);
    if (res.data?.data) {
      res.data.data = normalizeRoom(res.data.data);
    }
    return res.data;
  },

  updateRoom: async (id: string | number, dto: UpdateRoomDto): Promise<ResponseData<Room>> => {
    const payload = {
      buildingId: dto.buildingId !== undefined ? (dto.buildingId !== null ? Number(dto.buildingId) : null) : undefined,
      name: dto.name,
      floor: dto.floor ? Number(dto.floor) : undefined,
      area: dto.area ? Number(dto.area) : undefined,
      listedPrice: dto.listedPrice !== undefined ? Number(dto.listedPrice) : undefined,
      standardDeposit: dto.standardDeposit !== undefined ? Number(dto.standardDeposit) : undefined,
      maxCapacity: dto.maxCapacity !== undefined ? Number(dto.maxCapacity) : undefined,
      furnishingLevel: dto.furnishingLevel,
      amenities: Array.isArray(dto.amenities)
        ? dto.amenities
        : (dto.amenities ? [dto.amenities] : undefined),
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : undefined,
      description: dto.description,
      status: dto.status,
      isPublic: dto.isPublic,
      province: dto.province,
      ward: dto.ward,
      addressDetail: dto.addressDetail,
      imageUrls: dto.imageUrls,
      latitude: dto.latitude !== undefined && dto.latitude !== null ? Number(dto.latitude) : undefined,
      longitude: dto.longitude !== undefined && dto.longitude !== null ? Number(dto.longitude) : undefined,
    };
    const res = await apiClient.put<ResponseData<Room>>(`/api/v1/landlord/rooms/${id}`, payload);
    if (res.data?.data) {
      res.data.data = normalizeRoom(res.data.data);
    }
    return res.data;
  },

  deleteRoom: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/rooms/${id}`);
    return res.data;
  },

  // 3. Dịch vụ tiện ích (UC 09 - 12)
  getServices: async (): Promise<ResponseData<UtilityService[]>> => {
    const res = await apiClient.get<ResponseData<UtilityService[]>>('/api/v1/landlord/services');
    if (res.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeService);
    }
    return res.data;
  },

  createService: async (dto: CreateServiceDto): Promise<ResponseData<UtilityService>> => {
    const payload = {
      name: dto.name,
      category: dto.category || 'OTHER',
      unit: dto.unit || 'Tháng',
      unitPrice: Number(dto.unitPrice ?? 0),
      billingMethod: dto.billingMethod || 'FIXED_PER_ROOM',
      scope: dto.scope || 'ALL',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };
    const res = await apiClient.post<ResponseData<UtilityService>>('/api/v1/landlord/services', payload);
    if (res.data?.data) {
      res.data.data = normalizeService(res.data.data);
    }
    return res.data;
  },

  updateService: async (id: string | number, dto: UpdateServiceDto): Promise<ResponseData<UtilityService>> => {
    const payload = {
      name: dto.name,
      category: dto.category,
      unit: dto.unit,
      unitPrice: dto.unitPrice !== undefined ? Number(dto.unitPrice) : undefined,
      billingMethod: dto.billingMethod,
      scope: dto.scope,
      isActive: dto.isActive,
    };
    const res = await apiClient.put<ResponseData<UtilityService>>(`/api/v1/landlord/services/${id}`, payload);
    if (res.data?.data) {
      res.data.data = normalizeService(res.data.data);
    }
    return res.data;
  },

  deleteService: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/services/${id}`);
    return res.data;
  },

  // 4. Khách thuê (UC 13 - 17)
  getTenants: async (params?: TenantFilterParams): Promise<ResponseData<Tenant[]>> => {
    const res = await apiClient.get<ResponseData<Tenant[]>>('/api/v1/landlord/tenants', {
      params: {
        buildingId: params?.buildingId,
        roomId: params?.roomId,
        keyword: params?.keyword,
        linkStatus: params?.linkStatus === 'ALL' ? undefined : params?.linkStatus,
      },
    });
    if (res.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeTenant);
    }
    return res.data;
  },

  createTenant: async (dto: CreateTenantDto): Promise<ResponseData<Tenant>> => {
    const payload = {
      roomId: Number(dto.roomId),
      fullName: dto.fullName,
      phone: dto.phone,
      idCardNumber: dto.idCardNumber || '',
      gender: dto.gender || 'Khác',
      dateOfBirth: dto.dateOfBirth,
      hometown: dto.hometown,
      idCardPhotoFront: dto.idCardPhotoFront,
      idCardPhotoBack: dto.idCardPhotoBack,
      isRepresentative: Boolean(dto.isRepresentative),
    };
    const res = await apiClient.post<ResponseData<Tenant>>('/api/v1/landlord/tenants', payload);
    if (res.data?.data) {
      res.data.data = normalizeTenant(res.data.data);
    }
    return res.data;
  },

  updateTenant: async (id: string | number, dto: UpdateTenantDto): Promise<ResponseData<Tenant>> => {
    const payload = {
      roomId: dto.roomId ? Number(dto.roomId) : undefined,
      fullName: dto.fullName,
      phone: dto.phone,
      idCardNumber: dto.idCardNumber,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth,
      hometown: dto.hometown,
      idCardPhotoFront: dto.idCardPhotoFront,
      idCardPhotoBack: dto.idCardPhotoBack,
      isRepresentative: dto.isRepresentative !== undefined ? Boolean(dto.isRepresentative) : undefined,
    };
    const res = await apiClient.put<ResponseData<Tenant>>(`/api/v1/landlord/tenants/${id}`, payload);
    if (res.data?.data) {
      res.data.data = normalizeTenant(res.data.data);
    }
    return res.data;
  },

  deleteTenant: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/tenants/${id}`);
    return res.data;
  },

  inviteTenantLink: async (tenantId: string | number, searchKeyword: string): Promise<ResponseData<Tenant>> => {
    const res = await apiClient.post<ResponseData<Tenant>>(
      `/api/v1/landlord/tenants/${tenantId}/invite-link`,
      { searchKeyword }
    );
    return res.data;
  },

  cancelTenantInvitation: async (tenantId: string | number): Promise<ResponseData<void>> => {
    const res = await apiClient.delete<ResponseData<void>>(
      `/api/v1/landlord/tenants/${tenantId}/cancel-invitation`
    );
    return res.data;
  },

  // 5. Hợp đồng thuê phòng (UC 18 - 21)
  getContracts: async (params?: ContractFilterParams): Promise<ResponseData<RentalContract[]>> => {
    const res = await apiClient.get<ResponseData<RentalContract[]>>('/api/v1/landlord/contracts', {
      params: {
        buildingId: params?.buildingId,
        status: params?.status === 'ALL' ? undefined : params?.status,
        search: params?.keyword,
      },
    });
    if (res.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeContract);
    }
    return res.data;
  },

  createContract: async (dto: CreateContractDto): Promise<ResponseData<RentalContract>> => {
    let endDate = dto.endDate;
    if (!endDate && dto.startDate) {
      const start = new Date(dto.startDate);
      const months = Number(dto.durationMonths || 12);
      start.setMonth(start.getMonth() + months);
      start.setDate(start.getDate() - 1);
      endDate = start.toISOString().slice(0, 10);
    }

    const payload = {
      roomId: Number(dto.roomId),
      representativeTenantId: Number(dto.representativeTenantId),
      startDate: dto.startDate,
      durationMonths: Number(dto.durationMonths || 12),
      endDate: endDate,
      rentPrice: Number(dto.rentPrice ?? 0),
      depositAmount: Number(dto.depositAmount ?? 0),
      paymentCycleDay: Number(dto.paymentCycleDay ?? 5),
      termsAndConditions: dto.termsAndConditions,
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : undefined,
      services: dto.services?.map((s) => ({
        serviceId: s.serviceId ? Number(s.serviceId) : undefined,
        serviceName: s.serviceName,
        unit: s.unit,
        appliedUnitPrice: Number(s.appliedUnitPrice || 0),
        billingMethod: s.billingMethod,
        initialIndex: Number(s.initialIndex || 0),
      })),
    };
    const res = await apiClient.post<ResponseData<RentalContract>>('/api/v1/landlord/contracts', payload);
    if (res.data?.data) {
      res.data.data = normalizeContract(res.data.data);
    }
    return res.data;
  },

  updateContract: async (id: string | number, dto: UpdateContractDto): Promise<ResponseData<RentalContract>> => {
    const payload = {
      endDate: dto.endDate,
      rentPrice: dto.rentPrice !== undefined ? Number(dto.rentPrice) : undefined,
      paymentCycleDay: dto.paymentCycleDay ? Number(dto.paymentCycleDay) : undefined,
      termsAndConditions: dto.termsAndConditions,
    };
    const res = await apiClient.put<ResponseData<RentalContract>>(`/api/v1/landlord/contracts/${id}`, payload);
    if (res.data?.data) {
      res.data.data = normalizeContract(res.data.data);
    }
    return res.data;
  },

  terminateContract: async (
    id: string | number,
    dto: TerminateContractDto
  ): Promise<ResponseData<TerminateContractResult>> => {
    const payload = {
      finalElectricIndex: Number(dto.finalElectricIndex ?? 0),
      finalWaterIndex: Number(dto.finalWaterIndex ?? 0),
      damageCost: Number(dto.damageCost ?? 0),
      damageNote: dto.damageNote,
    };
    const res = await apiClient.post<ResponseData<TerminateContractResult>>(
      `/api/v1/landlord/contracts/${id}/terminate`,
      payload
    );
    return res.data;
  },

  // 6. Hóa đơn & Thu tiền (UC 22 - 26) -> Invoices
  getBills: async (params?: BillFilterParams): Promise<ResponseData<Bill[]>> => {
    let st = params?.status === 'ALL' ? undefined : params?.status;
    if (st === 'PENDING') st = 'UNPAID';
    if (st === 'PARTIAL') st = 'PARTIALLY_PAID';

    const res = await apiClient.get<ResponseData<Bill[]>>('/api/v1/landlord/invoices', {
      params: {
        buildingId: params?.buildingId,
        billingPeriod: params?.billingPeriod,
        status: st,
      },
    });
    if (res.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeBill);
    }
    return res.data;
  },

  createBill: async (dto: CreateBillDto): Promise<ResponseData<Bill>> => {
    let dueDate = dto.dueDate;
    if (!dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 10);
      dueDate = d.toISOString().split('T')[0];
    }
    const payload = {
      contractId: dto.contractId ? Number(dto.contractId) : undefined,
      roomId: dto.roomId ? Number(dto.roomId) : undefined,
      billingPeriod: dto.billingPeriod,
      dueDate: dueDate,
      otherAmount: Number(dto.otherAmount ?? 0),
      otherNote: dto.otherNote || '',
      isDraft: Boolean(dto.isDraft),
      items: dto.items?.map((it) => ({
        contractServiceId: it.contractServiceId ? Number(it.contractServiceId) : undefined,
        itemName: it.itemName,
        billingMethod: it.billingMethod,
        previousIndex: it.previousIndex !== undefined ? Number(it.previousIndex) : undefined,
        currentIndex: it.currentIndex !== undefined ? Number(it.currentIndex) : undefined,
        quantity: it.quantity !== undefined ? Number(it.quantity) : 1,
        unitPrice: Number(it.unitPrice ?? 0),
        amount: Number(it.amount ?? 0),
        note: it.note,
      })),
    };
    try {
      const res = await apiClient.post<ResponseData<Bill>>('/api/v1/landlord/invoices', payload);
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 405 || err?.response?.data?.errorDesc?.includes('POST')) {
        const res = await apiClient.post<ResponseData<Bill>>('/api/v1/landlord/invoices/meter-reading', payload);
        return res.data;
      }
      throw err;
    }
  },

  publishBill: async (id: string | number): Promise<ResponseData<Bill>> => {
    const res = await apiClient.put<ResponseData<Bill>>(`/api/v1/landlord/invoices/${id}/publish`);
    return res.data;
  },

  updateBill: async (id: string | number, dto: UpdateBillDto): Promise<ResponseData<Bill>> => {
    const payload = {
      dueDate: dto.dueDate,
      otherAmount: dto.otherAmount !== undefined ? Number(dto.otherAmount) : undefined,
      otherNote: dto.otherNote,
      items: dto.items,
    };
    const res = await apiClient.put<ResponseData<Bill>>(`/api/v1/landlord/invoices/${id}`, payload);
    return res.data;
  },

  cancelBill: async (id: string | number, reason: string): Promise<ResponseData<string>> => {
    const res = await apiClient.post<ResponseData<string>>(`/api/v1/landlord/invoices/${id}/cancel`, { reason });
    return res.data;
  },

  confirmPayment: async (id: string | number, dto: ConfirmPaymentDto): Promise<ResponseData<Bill>> => {
    const payload = {
      paymentAmount: Number(dto.paymentAmount ?? 0),
      paymentMethod: dto.paymentMethod || 'CASH',
      paymentNote: dto.paymentNote,
    };
    try {
      const res = await apiClient.post<ResponseData<Bill>>(`/api/v1/landlord/invoices/${id}/payment`, payload);
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 405 || err?.response?.data?.errorDesc?.includes('POST')) {
        const res = await apiClient.post<ResponseData<Bill>>(`/api/v1/landlord/invoices/${id}/confirm-payment`, payload);
        return res.data;
      }
      throw err;
    }
  },

  // 7. Khiếu nại (UC 27 - 28)
  getComplaints: async (params?: ComplaintFilterParams): Promise<ResponseData<Complaint[]>> => {
    let st = params?.status === 'ALL' ? undefined : params?.status;
    if (st === 'NEW') st = 'PENDING';

    const res = await apiClient.get<ResponseData<Complaint[]>>('/api/v1/landlord/complaints', {
      params: {
        buildingId: params?.buildingId,
        status: st,
      },
    });
    if (res.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeComplaint);
    }
    return res.data;
  },

  getComplaintById: async (id: string | number): Promise<ResponseData<Complaint>> => {
    const res = await apiClient.get<ResponseData<Complaint>>(`/api/v1/landlord/complaints/${id}`);
    if (res.data?.data) {
      res.data.data = normalizeComplaint(res.data.data);
    }
    return res.data;
  },

  updateComplaintProgress: async (
    id: string | number,
    dto: UpdateComplaintProgressDto
  ): Promise<ResponseData<Complaint>> => {
    const payload = {
      status: dto.status,
      resolutionNote: dto.resolutionNote || '',
    };
    const res = await apiClient.put<ResponseData<Complaint>>(
      `/api/v1/landlord/complaints/${id}/handle`,
      payload
    );
    return res.data;
  },

  // 8. Dashboard (UC 29)
  getDashboardData: async (): Promise<ResponseData<LandlordDashboardData>> => {
    const res = await apiClient.get<ResponseData<LandlordDashboardData>>('/api/v1/landlord/dashboard');
    return res.data;
  },
};
