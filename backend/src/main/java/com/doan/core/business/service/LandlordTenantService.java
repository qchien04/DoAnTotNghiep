package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.tenant.TenantLinkInviteRequest;
import com.doan.core.business.dto.landlord.tenant.TenantRequest;
import com.doan.core.business.dto.landlord.tenant.TenantResponse;

import java.util.List;

public interface LandlordTenantService {

    List<TenantResponse> searchTenants(Long landlordId, Long buildingId, Long roomId, String keyword);

    TenantResponse getTenantById(Long landlordId, Long tenantId);

    TenantResponse addTenant(Long landlordId, TenantRequest request);

    TenantResponse updateTenant(Long landlordId, Long tenantId, TenantRequest request);

    void removeTenant(Long landlordId, Long tenantId);

    void inviteUserLink(Long landlordId, Long tenantId, TenantLinkInviteRequest request);
}
