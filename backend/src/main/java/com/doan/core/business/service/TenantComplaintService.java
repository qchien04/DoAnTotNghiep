package com.doan.core.business.service;

import com.doan.core.business.dto.tenant.RateComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintResponse;
import com.doan.core.business.enums.ComplaintSeverity;
import com.doan.core.business.enums.ComplaintStatus;
import com.doan.core.common.data.PageResponse;

public interface TenantComplaintService {

    // UC 18: Danh sách các khiếu nại của tôi
    PageResponse<TenantComplaintResponse> getMyComplaints(Long userId, String keyword, ComplaintStatus status, ComplaintSeverity severity,
            int page, int size, String sortBy, String sortDirection);

    // UC 18: Gửi phản ánh / khiếu nại sự cố mới
    TenantComplaintResponse createComplaint(Long userId, TenantComplaintRequest request);

    // Chi tiết khiếu nại
    TenantComplaintResponse getComplaintById(Long userId, Long complaintId);

    // Đánh giá chất lượng sửa chữa của thợ
    void rateComplaint(Long userId, Long complaintId, RateComplaintRequest request);
}
