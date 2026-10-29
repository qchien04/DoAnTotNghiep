package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.complaint.ComplaintHandleRequest;
import com.doan.core.business.dto.landlord.complaint.ComplaintResponse;
import com.doan.core.business.enums.ComplaintStatus;
import com.doan.core.common.data.PageResponse;

public interface LandlordComplaintService {

    PageResponse<ComplaintResponse> getComplaints(Long landlordId, Long buildingId, ComplaintStatus status,
            String keyword, int page, int size, String sortBy, String sortDirection);

    ComplaintResponse getComplaintById(Long landlordId, Long complaintId);

    ComplaintResponse handleComplaint(Long landlordId, Long complaintId, ComplaintHandleRequest request);
}
