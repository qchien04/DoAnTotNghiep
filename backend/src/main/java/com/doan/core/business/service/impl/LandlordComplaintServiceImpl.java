package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.complaint.ComplaintHandleRequest;
import com.doan.core.business.dto.landlord.complaint.ComplaintResponse;
import com.doan.core.business.entity.Complaint;
import com.doan.core.business.entity.Notification;
import com.doan.core.business.repository.ComplaintRepository;
import com.doan.core.business.repository.NotificationRepository;
import com.doan.core.business.service.LandlordComplaintService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordComplaintServiceImpl implements LandlordComplaintService {

    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaints(Long landlordId, Long buildingId, String status) {
        String normalizedStatus = status;
        if ("NEW".equalsIgnoreCase(status)) {
            normalizedStatus = "PENDING";
        }
        log.info("Lấy danh sách khiếu nại báo hỏng cho chủ trọ id: {}, tòa: {}, trạng thái: {}", landlordId, buildingId, normalizedStatus);
        List<Complaint> complaints = complaintRepository.filterComplaints(landlordId, buildingId, normalizedStatus);

        return complaints.stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long landlordId, Long complaintId) {
        Complaint complaint = complaintRepository.findByIdAndRoomBuildingLandlordId(complaintId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPLAINT_NOT_FOUND));

        return ComplaintResponse.fromEntity(complaint);
    }

    @Override
    @Transactional
    public ComplaintResponse handleComplaint(Long landlordId, Long complaintId, ComplaintHandleRequest request) {
        log.info("Xử lý khiếu nại id: {} của chủ trọ: {}, trạng thái mới: {}", complaintId, landlordId, request.getStatus());

        Complaint complaint = complaintRepository.findByIdAndRoomBuildingLandlordId(complaintId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPLAINT_NOT_FOUND));

        complaint.setStatus(request.getStatus().trim());
        complaint.setResolutionNote(request.getResolutionNote());

        if ("RESOLVED".equalsIgnoreCase(request.getStatus())) {
            complaint.setResolvedAt(Instant.now());
        }

        Complaint updated = complaintRepository.save(complaint);

        // Bắn thông báo đẩy cho khách thuê
        if (complaint.getTenant() != null && complaint.getTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(complaint.getTenant().getUser())
                    .title("Cập nhật tiến độ xử lý khiếu nại: " + complaint.getTitle())
                    .content("Trạng thái mới: " + complaint.getStatus() + ". Ghi chú từ chủ trọ: " + complaint.getResolutionNote())
                    .notificationType("COMPLAINT")
                    .relatedEntityType("COMPLAINT")
                    .relatedEntityId(complaint.getId())
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        }

        return ComplaintResponse.fromEntity(updated);
    }
}
