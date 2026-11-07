import apiClient from './api';
import { ResponseData, PageResponse } from '@/shared/types/api';
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
  InvoiceResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoicePaymentRequest,
  InvoiceFilterParams,
  Complaint,
  UpdateComplaintProgressDto,
  ComplaintFilterParams,
  LandlordDashboardData,
} from '@/shared/types/landlord';

export const landlordService = {
  // 1. Tòa nhà (UC 01 - 04)
  getBuildings: async (params?: BuildingFilterParams): Promise<ResponseData<PageResponse<Building>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<Building>>>('/api/v1/landlord/buildings', {
      params: {
        keyword: params?.keyword,
        floors: params?.floors,
        page: params?.page,
        size: params?.size,
        sortBy: params?.sortBy,
        sortDirection: params?.sortDirection,
      },
    });
    return res.data;
  },

  getBuildingById: async (id: string | number): Promise<ResponseData<Building>> => {
    const res = await apiClient.get<ResponseData<Building>>(`/api/v1/landlord/buildings/${id}`);
    return res.data;
  },

  createBuilding: async (dto: CreateBuildingDto): Promise<ResponseData<Building>> => {
    const res = await apiClient.post<ResponseData<Building>>('/api/v1/landlord/buildings', dto);
    return res.data;
  },

  updateBuilding: async (id: string | number, dto: UpdateBuildingDto): Promise<ResponseData<Building>> => {
    const res = await apiClient.put<ResponseData<Building>>(`/api/v1/landlord/buildings/${id}`, dto);
    return res.data;
  },

  deleteBuilding: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/buildings/${id}`);
    return res.data;
  },

  // 2. Phòng trọ (UC 05 - 08)
  getRooms: async (params?: RoomFilterParams): Promise<ResponseData<PageResponse<Room>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<Room>>>('/api/v1/landlord/rooms', {
      params: {
        buildingId: params?.buildingId,
        status: params?.status === 'ALL' ? undefined : params?.status,
        floor: params?.floor,
        search: params?.keyword,
        page: params?.page,
        size: params?.size,
        sortBy: params?.sortBy,
        sortDirection: params?.sortDirection,
      },
    });
    return res.data;
  },

  getRoomById: async (id: string | number): Promise<ResponseData<Room>> => {
    const res = await apiClient.get<ResponseData<Room>>(`/api/v1/landlord/rooms/${id}`);
    return res.data;
  },

  createRoom: async (dto: CreateRoomDto): Promise<ResponseData<Room>> => {
    const payload = {
      ...dto,
      buildingId: dto.buildingId !== undefined && dto.buildingId !== null ? Number(dto.buildingId) : null,
      floor: Number(dto.floor || 1),
      area: Number(dto.area || 20),
      listedPrice: Number(dto.listedPrice ?? 0),
      standardDeposit: Number(dto.standardDeposit ?? 0),
      maxCapacity: Number(dto.maxCapacity ?? 2),
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : [],
    };
    const res = await apiClient.post<ResponseData<Room>>('/api/v1/landlord/rooms', payload);
    return res.data;
  },

  updateRoom: async (id: string | number, dto: UpdateRoomDto): Promise<ResponseData<Room>> => {
    const payload = {
      ...dto,
      buildingId: dto.buildingId !== undefined ? (dto.buildingId !== null ? Number(dto.buildingId) : null) : undefined,
      floor: dto.floor ? Number(dto.floor) : undefined,
      area: dto.area ? Number(dto.area) : undefined,
      listedPrice: dto.listedPrice !== undefined ? Number(dto.listedPrice) : undefined,
      standardDeposit: dto.standardDeposit !== undefined ? Number(dto.standardDeposit) : undefined,
      maxCapacity: dto.maxCapacity !== undefined ? Number(dto.maxCapacity) : undefined,
      serviceIds: dto.serviceIds ? dto.serviceIds.map(Number) : undefined,
    };
    const res = await apiClient.put<ResponseData<Room>>(`/api/v1/landlord/rooms/${id}`, payload);
    return res.data;
  },

  deleteRoom: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/rooms/${id}`);
    return res.data;
  },

  // 3. Dịch vụ tiện ích (UC 09 - 12)
  getServices: async (): Promise<ResponseData<UtilityService[]>> => {
    const res = await apiClient.get<ResponseData<UtilityService[]>>('/api/v1/landlord/services');
    return res.data;
  },

  createService: async (dto: CreateServiceDto): Promise<ResponseData<UtilityService>> => {
    const res = await apiClient.post<ResponseData<UtilityService>>('/api/v1/landlord/services', dto);
    return res.data;
  },

  updateService: async (id: string | number, dto: UpdateServiceDto): Promise<ResponseData<UtilityService>> => {
    const res = await apiClient.put<ResponseData<UtilityService>>(`/api/v1/landlord/services/${id}`, dto);
    return res.data;
  },

  deleteService: async (id: string | number): Promise<ResponseData<string>> => {
    const res = await apiClient.delete<ResponseData<string>>(`/api/v1/landlord/services/${id}`);
    return res.data;
  },

  // 4. Khách thuê (UC 13 - 17)
  getTenants: async (params?: TenantFilterParams): Promise<ResponseData<PageResponse<Tenant>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<Tenant>>>('/api/v1/landlord/tenants', {
      params: {
        buildingId: params?.buildingId,
        roomId: params?.roomId,
        keyword: params?.keyword,
        linkStatus: params?.linkStatus === 'ALL' ? undefined : params?.linkStatus,
        page: params?.page,
        size: params?.size,
        sortBy: params?.sortBy,
        sortDirection: params?.sortDirection,
      },
    });
    return res.data;
  },

  getTenantById: async (id: string | number): Promise<ResponseData<Tenant>> => {
    const res = await apiClient.get<ResponseData<Tenant>>(`/api/v1/landlord/tenants/${id}`);
    return res.data;
  },

  createTenant: async (dto: CreateTenantDto): Promise<ResponseData<Tenant>> => {
    const payload = {
      ...dto,
      isRepresentative: Boolean(dto.isRepresentative),
    };
    const res = await apiClient.post<ResponseData<Tenant>>('/api/v1/landlord/tenants', payload);
    return res.data;
  },

  updateTenant: async (id: string | number, dto: UpdateTenantDto): Promise<ResponseData<Tenant>> => {
    const payload = {
      ...dto,
      isRepresentative: dto.isRepresentative !== undefined ? Boolean(dto.isRepresentative) : undefined,
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
  getContracts: async (params?: ContractFilterParams): Promise<ResponseData<PageResponse<RentalContract>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<RentalContract>>>('/api/v1/landlord/contracts', {
      params: {
        buildingId: params?.buildingId,
        status: params?.status === 'ALL' ? undefined : params?.status,
        keyword: params?.keyword,
        page: params?.page,
        size: params?.size,
        sortBy: params?.sortBy,
        sortDirection: params?.sortDirection,
      },
    });
    return res.data;
  },

  getContractById: async (id: string | number): Promise<ResponseData<RentalContract>> => {
    const res = await apiClient.get<ResponseData<RentalContract>>(`/api/v1/landlord/contracts/${id}`);
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
      services: dto.services?.map((s) => ({
        serviceId: Number(s.serviceId),
        initialIndex: Number(s.initialIndex || 0),
      })),
    };
    const res = await apiClient.post<ResponseData<RentalContract>>('/api/v1/landlord/contracts', payload);
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
    return res.data;
  },

  terminateContract: async (
    id: string | number,
    dto: TerminateContractDto
  ): Promise<ResponseData<TerminateContractResult>> => {
    const payload = {
      meterReadings: dto.meterReadings ?? [],
      damageCost: Number(dto.damageCost ?? 0),
      damageNote: dto.damageNote,
    };
    const res = await apiClient.post<ResponseData<TerminateContractResult>>(
      `/api/v1/landlord/contracts/${id}/terminate`,
      payload
    );
    return res.data;
  },

  // 6. Hóa đơn (UC 22 - 26)
  getInvoices: async (params?: InvoiceFilterParams): Promise<ResponseData<PageResponse<InvoiceResponse>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<InvoiceResponse>>>('/api/v1/landlord/invoices', {
      params: {
        buildingId: params?.buildingId,
        billingPeriod: params?.billingPeriod,
        status: params?.status === 'ALL' ? undefined : params?.status,
        keyword: params?.keyword,
        page: params?.page,
        size: params?.size,
        sortBy: params?.sortBy,
        sortDirection: params?.sortDirection,
      },
    });
    return res.data;
  },

  getInvoiceById: async (id: string | number): Promise<ResponseData<InvoiceResponse>> => {
    const res = await apiClient.get<ResponseData<InvoiceResponse>>(`/api/v1/landlord/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (dto: CreateInvoiceRequest): Promise<ResponseData<InvoiceResponse>> => {
    const res = await apiClient.post<ResponseData<InvoiceResponse>>('/api/v1/landlord/invoices', dto);
    return res.data;
  },

  publishInvoice: async (id: string | number): Promise<ResponseData<InvoiceResponse>> => {
    const res = await apiClient.put<ResponseData<InvoiceResponse>>(`/api/v1/landlord/invoices/${id}/publish`);
    return res.data;
  },

  updateInvoice: async (id: string | number, dto: UpdateInvoiceRequest): Promise<ResponseData<InvoiceResponse>> => {
    const res = await apiClient.put<ResponseData<InvoiceResponse>>(`/api/v1/landlord/invoices/${id}`, dto);
    return res.data;
  },

  cancelInvoice: async (id: string | number, cancelReason: string): Promise<ResponseData<string>> => {
    const res = await apiClient.post<ResponseData<string>>(`/api/v1/landlord/invoices/${id}/cancel`, { cancelReason });
    return res.data;
  },

  confirmPayment: async (id: string | number, dto: InvoicePaymentRequest): Promise<ResponseData<InvoiceResponse>> => {
    const res = await apiClient.post<ResponseData<InvoiceResponse>>(`/api/v1/landlord/invoices/${id}/payment`, dto);
    return res.data;
  },

  // 7. Khiếu nại (UC 27 - 28)
  getComplaints: async (params?: ComplaintFilterParams): Promise<ResponseData<PageResponse<Complaint>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<Complaint>>>('/api/v1/landlord/complaints', {
      params: {
        buildingId: params?.buildingId,
        status: params?.status === 'ALL' ? undefined : params?.status,
        keyword: params?.keyword,
        page: params?.page,
        size: params?.size,
        sortBy: params?.sortBy,
        sortDirection: params?.sortDirection,
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
