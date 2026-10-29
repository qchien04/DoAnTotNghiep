package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.complaint.ComplaintHandleRequest;
import com.doan.core.business.dto.landlord.complaint.ComplaintResponse;
import com.doan.core.business.entity.Complaint;
import com.doan.core.business.enums.ComplaintStatus;
import com.doan.core.business.entity.Notification;
import com.doan.core.business.enums.NotificationType;
import com.doan.core.business.repository.ComplaintRepository;
import com.doan.core.business.repository.NotificationRepository;
import com.doan.core.business.service.LandlordComplaintService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class LandlordComplaintServiceImpl implements LandlordComplaintService {

    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ComplaintResponse> getComplaints(Long landlordId, Long buildingId, ComplaintStatus status,
            String keyword, int page, int size, String sortBy, String sortDirection) {
        String kw = (keyword != null && !keyword.trim().isBlank()) ? keyword.trim() : null;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortProperty = switch (sortBy != null ? sortBy.toLowerCase() : "id") {
            case "createdat" -> "createdAt";
            case "status" -> "status";
            case "severity" -> "severity";
            default -> "id";
        };
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(direction, sortProperty);

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        log.info(
                "Lấy danh sách khiếu nại báo hỏng cho chủ trọ id: {}, tòa: {}, trạng thái: {}, keyword: {}, pageable: {}",
                landlordId, buildingId, status, kw, pageable);
        Page<Complaint> complaints = complaintRepository.filterComplaints(landlordId, buildingId, status, kw,
                pageable);

        Page<ComplaintResponse> dtoPage = complaints.map(ComplaintResponse::fromEntity);
        return PageResponse.from(dtoPage);
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
        log.info("Xử lý khiếu nại id: {} của chủ trọ: {}, trạng thái mới: {}", complaintId, landlordId,
                request.getStatus());

        Complaint complaint = complaintRepository.findByIdAndRoomBuildingLandlordId(complaintId, landlordId)
                .orElseThrow(() -> new BaseException(ErrorCode.COMPLAINT_NOT_FOUND));

        if (request.getStatus() == null) {
            throw new BaseException(ErrorCode.BAD_REQUEST, "Trạng thái không được để trống");
        }
        ComplaintStatus newStatus = request.getStatus();

        complaint.setStatus(newStatus);
        complaint.setResolutionNote(request.getResolutionNote());

        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(Instant.now());
        }

        Complaint updated = complaintRepository.save(complaint);

        // Bắn thông báo đẩy cho khách thuê
        if (complaint.getTenant() != null && complaint.getTenant().getUser() != null) {
            Notification n = Notification.builder()
                    .user(complaint.getTenant().getUser())
                    .title("Cập nhật tiến độ xử lý khiếu nại: " + complaint.getTitle())
                    .content("Trạng thái mới: " + complaint.getStatus() + ". Ghi chú từ chủ trọ: "
                            + complaint.getResolutionNote())
                    .notificationType(NotificationType.COMPLAINT)
                    .relatedEntityType("COMPLAINT")
                    .relatedEntityId(complaint.getId())
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        }

        return ComplaintResponse.fromEntity(updated);
    }
}
