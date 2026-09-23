import apiClient from './api';
import { ResponseData } from '@/shared/types/api';
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
  ...b,
  code: b.buildingCode || b.code,
  address: b.addressDetail || b.address,
  totalFloors: b.numFloors !== undefined ? b.numFloors : b.totalFloors,
  amenities: Array.isArray(b.amenities)
    ? b.amenities
    : (typeof b.commonAmenities === 'string' && b.commonAmenities.trim()
        ? b.commonAmenities.split(',').map((s: string) => s.trim())
        : (b.commonAmenities || [])),
  rules: b.generalRules || b.rules,
});

const normalizeRoom = (r: any): Room => ({
  ...r,
  code: r.roomCode || r.code,
  price: r.listedPrice !== undefined ? r.listedPrice : r.price,
  deposit: r.standardDeposit !== undefined ? r.standardDeposit : r.deposit,
  capacity: r.maxCapacity !== undefined ? r.maxCapacity : r.capacity,
  currentTenantsCount: r.currentOccupancy !== undefined ? r.currentOccupancy : r.currentTenantsCount,
  latitude: r.latitude !== undefined && r.latitude !== null ? Number(r.latitude) : undefined,
  longitude: r.longitude !== undefined && r.longitude !== null ? Number(r.longitude) : undefined,
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
  const code = c.contractCode || c.contractNumber || (c.id ? `HD${String(c.id).padStart(2, '0')}` : 'HD01');
  const rName = c.roomCode || c.roomName || (c.roomId ? `Phòng #${c.roomId}` : 'Phòng trọ');
  const tName = c.representativeTenantName || c.tenantName || '---';
  const tPhone = c.representativeTenantPhone || c.tenantPhone || '';
  const price = Number(c.rentPrice !== undefined ? c.rentPrice : (c.monthlyRent !== undefined ? c.monthlyRent : 0));
  const months = c.durationMonths || calculateMonthsBetween(c.startDate, c.endDate);

  return {
    ...c,
    contractCode: code,
    contractNumber: code,
    roomName: rName,
    roomCode: c.roomCode || rName,
    tenantName: tName,
    representativeTenantName: tName,
    tenantPhone: tPhone,
    representativeTenantPhone: tPhone,
    rentPrice: price,
    monthlyRent: price,
    durationMonths: months,
    depositAmount: Number(c.depositAmount || 0),
    initialElectricIndex: c.initialElectricIndex ?? c.initialElectricityReading ?? 0,
    initialWaterIndex: c.initialWaterIndex ?? c.initialWaterReading ?? 0,
    initialElectricityReading: c.initialElectricIndex ?? c.initialElectricityReading ?? 0,
    initialWaterReading: c.initialWaterIndex ?? c.initialWaterReading ?? 0,
  };
};

const normalizeService = (s: any): UtilityService => {
  if (!s) return s;
  const isAct = s.isActive !== undefined ? Boolean(s.isActive) : (s.status ? s.status === 'ACTIVE' : true);
  const uPrice = Number(s.unitPrice !== undefined ? s.unitPrice : (s.price !== undefined ? s.price : 0));
  const sCode = s.serviceCode || s.code || (s.id ? `DV${String(s.id).padStart(2, '0')}` : 'DV01');
  const bMethod = s.billingMethod || (
    s.chargingType === 'METER' || s.chargingType === 'METER_INDEX'
      ? 'METER_INDEX'
      : (s.chargingType === 'PER_PERSON' || s.chargingType === 'FIXED_PER_PERSON'
          ? 'FIXED_PER_PERSON'
          : (s.chargingType === 'FIXED_PER_UNIT' ? 'FIXED_PER_UNIT' : 'FIXED_PER_ROOM'))
  );
  const scp = s.scope || s.appliedScope || 'ALL';

  return {
    ...s,
    id: s.id,
    serviceCode: sCode,
    code: sCode,
    name: s.name || s.serviceName || '',
    category: s.category || 'OTHER',
    unit: s.unit || 'Tháng',
    unitPrice: uPrice,
    price: uPrice,
    billingMethod: bMethod,
    chargingType: bMethod as any,
    scope: scp,
    appliedScope: scp === 'ALL' ? 'Tất cả' : scp,
    isActive: isAct,
    status: isAct ? 'ACTIVE' : 'SUSPENDED',
  };
};

export const landlordService = {
  // 1. Tòa nhà (UC 01 - 04)
  getBuildings: async (params?: BuildingFilterParams): Promise<ResponseData<Building[]>> => {
    const res = await apiClient.get<ResponseData<Building[]>>('/api/v1/landlord/buildings', {
      params: {
        keyword: params?.keyword,
        search: params?.keyword,
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
      buildingCode: dto.buildingCode || dto.code || `TN${Date.now().toString().slice(-4)}`,
      name: dto.name,
      province: dto.province,
      district: dto.district,
      ward: dto.ward,
      addressDetail: dto.addressDetail || dto.address || '',
      numFloors: Number(dto.numFloors || dto.totalFloors || 1),
      generalRules: dto.generalRules || (typeof dto.rules === 'string' ? dto.rules : undefined),
      commonAmenities: Array.isArray(dto.amenities)
        ? dto.amenities
        : (Array.isArray(dto.commonAmenities)
            ? dto.commonAmenities
            : (dto.commonAmenities ? [dto.commonAmenities] : (dto.amenities ? [dto.amenities] : []))),
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : undefined,
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
      buildingCode: dto.buildingCode || dto.code,
      name: dto.name,
      province: dto.province,
      district: dto.district,
      ward: dto.ward,
      addressDetail: dto.addressDetail || dto.address,
      numFloors: dto.numFloors || dto.totalFloors ? Number(dto.numFloors || dto.totalFloors) : undefined,
      generalRules: dto.generalRules || (typeof dto.rules === 'string' ? dto.rules : undefined),
      commonAmenities: Array.isArray(dto.amenities)
        ? dto.amenities
        : (Array.isArray(dto.commonAmenities)
            ? dto.commonAmenities
            : (dto.commonAmenities ? [dto.commonAmenities] : (dto.amenities ? [dto.amenities] : undefined))),
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : undefined,
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
    const res = await apiClient.get<ResponseData<Room[]>>('/api/v1/landlord/rooms', {
      params: {
        buildingId: params?.buildingId,
        status: params?.status === 'ALL' ? undefined : params?.status,
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
    const code = dto.roomCode || dto.code || `P${Date.now().toString().slice(-3)}`;
    const payload = {
      buildingId: Number(dto.buildingId),
      roomCode: code,
      name: dto.name || `Phòng ${code}`,
      floor: Number(dto.floor || 1),
      area: Number(dto.area || 20),
      listedPrice: Number(dto.listedPrice ?? dto.price ?? 0),
      standardDeposit: Number(dto.standardDeposit ?? dto.deposit ?? 0),
      maxCapacity: Number(dto.maxCapacity ?? dto.capacity ?? 2),
      furnishingLevel: dto.furnishingLevel || 'BASIC',
      amenities: Array.isArray(dto.amenities)
        ? dto.amenities
        : (dto.amenities ? [dto.amenities] : []),
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : [],
      description: dto.description || '',
      status: dto.status || 'AVAILABLE',
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
      buildingId: dto.buildingId ? Number(dto.buildingId) : undefined,
      roomCode: dto.roomCode || dto.code,
      name: dto.name,
      floor: dto.floor ? Number(dto.floor) : undefined,
      area: dto.area ? Number(dto.area) : undefined,
      listedPrice: dto.listedPrice !== undefined || dto.price !== undefined ? Number(dto.listedPrice ?? dto.price) : undefined,
      standardDeposit: dto.standardDeposit !== undefined || dto.deposit !== undefined ? Number(dto.standardDeposit ?? dto.deposit) : undefined,
      maxCapacity: dto.maxCapacity !== undefined || dto.capacity !== undefined ? Number(dto.maxCapacity ?? dto.capacity) : undefined,
      furnishingLevel: dto.furnishingLevel,
      amenities: Array.isArray(dto.amenities)
        ? dto.amenities
        : (dto.amenities ? [dto.amenities] : undefined),
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : undefined,
      description: dto.description,
      status: dto.status,
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
    const method = dto.billingMethod || (
      dto.chargingType === 'METER' || dto.chargingType === 'METER_INDEX'
        ? 'METER_INDEX'
        : (dto.chargingType === 'PER_PERSON' || dto.chargingType === 'FIXED_PER_PERSON'
            ? 'FIXED_PER_PERSON'
            : (dto.chargingType === 'FIXED_PER_UNIT' ? 'FIXED_PER_UNIT' : 'FIXED_PER_ROOM'))
    );
    const payload = {
      serviceCode: dto.serviceCode || dto.code || `DV${Date.now().toString().slice(-3)}`,
      name: dto.name,
      category: dto.category || 'OTHER',
      unit: dto.unit || 'Tháng',
      unitPrice: Number(dto.unitPrice !== undefined ? dto.unitPrice : (dto.price !== undefined ? dto.price : 0)),
      billingMethod: method,
      scope: dto.scope || dto.appliedScope || 'ALL',
      isActive: dto.isActive !== undefined ? dto.isActive : (dto.status ? dto.status === 'ACTIVE' : true),
    };
    const res = await apiClient.post<ResponseData<UtilityService>>('/api/v1/landlord/services', payload);
    if (res.data?.data) {
      res.data.data = normalizeService(res.data.data);
    }
    return res.data;
  },

  updateService: async (id: string | number, dto: UpdateServiceDto): Promise<ResponseData<UtilityService>> => {
    const method = dto.billingMethod || (
      dto.chargingType === 'METER' || dto.chargingType === 'METER_INDEX'
        ? 'METER_INDEX'
        : (dto.chargingType === 'PER_PERSON' || dto.chargingType === 'FIXED_PER_PERSON'
            ? 'FIXED_PER_PERSON'
            : (dto.chargingType === 'FIXED_PER_UNIT' ? 'FIXED_PER_UNIT' : (dto.chargingType ? 'FIXED_PER_ROOM' : undefined)))
    );
    const payload = {
      serviceCode: dto.serviceCode || dto.code,
      name: dto.name,
      category: dto.category,
      unit: dto.unit,
      unitPrice: dto.unitPrice !== undefined || dto.price !== undefined ? Number(dto.unitPrice ?? dto.price) : undefined,
      billingMethod: method,
      scope: dto.scope || dto.appliedScope,
      isActive: dto.isActive !== undefined ? dto.isActive : (dto.status ? dto.status === 'ACTIVE' : undefined),
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
        roomId: params?.roomId,
        search: params?.keyword,
        linkStatus: params?.linkStatus === 'ALL' ? undefined : params?.linkStatus,
      },
    });
    return res.data;
  },

  createTenant: async (dto: CreateTenantDto): Promise<ResponseData<Tenant>> => {
    const payload = {
      roomId: Number(dto.roomId),
      fullName: dto.fullName,
      phone: dto.phone,
      idCardNumber: dto.idCardNumber || dto.identityCard || '',
      gender: dto.gender || 'Khác',
      dateOfBirth: dto.dateOfBirth || dto.birthDate,
      hometown: dto.hometown,
      idCardPhotoFront: dto.idCardPhotoFront || dto.idCardFrontImage,
      idCardPhotoBack: dto.idCardPhotoBack || dto.idCardBackImage,
      isRepresentative: dto.isRepresentative ?? (dto.roleInRoom === 'REPRESENTATIVE'),
    };
    const res = await apiClient.post<ResponseData<Tenant>>('/api/v1/landlord/tenants', payload);
    return res.data;
  },

  updateTenant: async (id: string | number, dto: UpdateTenantDto): Promise<ResponseData<Tenant>> => {
    const payload = {
      roomId: dto.roomId ? Number(dto.roomId) : undefined,
      fullName: dto.fullName,
      phone: dto.phone,
      idCardNumber: dto.idCardNumber || dto.identityCard,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth || dto.birthDate,
      hometown: dto.hometown,
      idCardPhotoFront: dto.idCardPhotoFront || dto.idCardFrontImage,
      idCardPhotoBack: dto.idCardPhotoBack || dto.idCardBackImage,
      isRepresentative: dto.isRepresentative ?? (dto.roleInRoom === 'REPRESENTATIVE'),
    };
    const res = await apiClient.put<ResponseData<Tenant>>(`/api/v1/landlord/tenants/${id}`, payload);
    return res.data;
  },

  deleteTenant: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/tenants/${id}`);
    return res.data;
  },

  inviteTenantLink: async (tenantId: string | number, searchKeyword: string): Promise<ResponseData<Tenant>> => {
    const res = await apiClient.post<ResponseData<Tenant>>(
      `/api/v1/landlord/tenants/${tenantId}/link`,
      null,
      { params: { searchKeyword } }
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
      representativeTenantId: Number(dto.representativeTenantId || dto.tenantId),
      contractCode: dto.contractCode || dto.contractNumber,
      startDate: dto.startDate,
      durationMonths: Number(dto.durationMonths || 12),
      endDate: endDate,
      rentPrice: Number(dto.rentPrice ?? dto.monthlyRent ?? 0),
      depositAmount: Number(dto.depositAmount ?? 0),
      paymentCycleDay: Number(dto.paymentCycleDay ?? 5),
      initialElectricIndex: Number(dto.initialElectricIndex ?? dto.initialElectricityReading ?? 0),
      initialWaterIndex: Number(dto.initialWaterIndex ?? dto.initialWaterReading ?? 0),
      termsAndConditions: dto.termsAndConditions || dto.termsNote,
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : undefined,
      services: dto.services,
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
      rentPrice: dto.rentPrice !== undefined || dto.monthlyRent !== undefined ? Number(dto.rentPrice ?? dto.monthlyRent) : undefined,
      paymentCycleDay: dto.paymentCycleDay ? Number(dto.paymentCycleDay) : undefined,
      termsAndConditions: dto.termsAndConditions || dto.termsNote,
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
      finalElectricIndex: Number(dto.finalElectricIndex ?? dto.finalElectricityReading ?? 0),
      finalWaterIndex: Number(dto.finalWaterIndex ?? dto.finalWaterReading ?? 0),
      damageCost: Number(dto.damageCost || (dto.damageDeductions?.reduce((acc, cur) => acc + cur.amount, 0)) || 0),
      damageNote: dto.damageNote || dto.note,
    };
    const res = await apiClient.post<ResponseData<TerminateContractResult>>(
      `/api/v1/landlord/contracts/${id}/terminate`,
      payload
    );
    return res.data;
  },

  // 6. Hóa đơn & Thu tiền (UC 22 - 26) -> Invoices
  getBills: async (params?: BillFilterParams): Promise<ResponseData<Bill[]>> => {
    const res = await apiClient.get<ResponseData<Bill[]>>('/api/v1/landlord/invoices', {
      params: {
        billingPeriod: params?.billingPeriod || params?.billingMonth,
        status: params?.status === 'ALL' ? undefined : params?.status,
      },
    });
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
      billingPeriod: dto.billingPeriod || dto.billingMonth || `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      dueDate: dueDate,
      currentElectricIndex: dto.currentElectricIndex !== undefined || dto.newElectricity !== undefined
        ? Number(dto.currentElectricIndex ?? dto.newElectricity) : undefined,
      currentWaterIndex: dto.currentWaterIndex !== undefined || dto.newWater !== undefined
        ? Number(dto.currentWaterIndex ?? dto.newWater) : undefined,
      otherAmount: Number(dto.otherAmount ?? 0),
      otherNote: dto.otherNote || '',
      items: dto.items,
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

  updateBill: async (id: string | number, dto: UpdateBillDto): Promise<ResponseData<Bill>> => {
    const payload = {
      dueDate: dto.dueDate,
      currentElectricIndex: dto.currentElectricIndex !== undefined || dto.newElectricity !== undefined
        ? Number(dto.currentElectricIndex ?? dto.newElectricity) : undefined,
      currentWaterIndex: dto.currentWaterIndex !== undefined || dto.newWater !== undefined
        ? Number(dto.currentWaterIndex ?? dto.newWater) : undefined,
      otherAmount: dto.otherAmount !== undefined ? Number(dto.otherAmount) : undefined,
      otherNote: dto.otherNote,
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
      paymentAmount: Number(dto.paymentAmount ?? dto.amount ?? 0),
      paymentMethod: dto.paymentMethod || 'CASH',
      paymentNote: dto.paymentNote || dto.note,
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
    const res = await apiClient.get<ResponseData<Complaint[]>>('/api/v1/landlord/complaints', {
      params: {
        status: params?.status === 'ALL' ? undefined : params?.status,
      },
    });
    return res.data;
  },

  getComplaintById: async (id: string | number): Promise<ResponseData<Complaint>> => {
    const res = await apiClient.get<ResponseData<Complaint>>(`/api/v1/landlord/complaints/${id}`);
    return res.data;
  },

  updateComplaintProgress: async (
    id: string | number,
    dto: UpdateComplaintProgressDto
  ): Promise<ResponseData<Complaint>> => {
    const payload = {
      status: dto.status,
      resolutionNote: dto.resolutionNote || dto.responseNote || '',
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
