package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.complaint.ComplaintHandleRequest;
import com.doan.core.business.dto.landlord.complaint.ComplaintResponse;

import java.util.List;

public interface LandlordComplaintService {

    List<ComplaintResponse> getComplaints(Long landlordId, Long buildingId, String status);

    ComplaintResponse getComplaintById(Long landlordId, Long complaintId);

    ComplaintResponse handleComplaint(Long landlordId, Long complaintId, ComplaintHandleRequest request);
}
