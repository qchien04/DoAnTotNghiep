package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.dashboard.LandlordDashboardResponse;

public interface LandlordDashboardService {

    LandlordDashboardResponse getDashboardStats(Long landlordId, String billingPeriod);
}
