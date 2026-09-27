package com.doan.core.business.service.impl;

import com.doan.core.business.dto.tenant.RateComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintResponse;
import com.doan.core.business.entity.Complaint;
import com.doan.core.business.entity.Tenant;
import com.doan.core.business.repository.ComplaintRepository;
import com.doan.core.business.repository.TenantRepository;
import com.doan.core.business.service.TenantComplaintService;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantComplaintServiceImpl implements TenantComplaintService {

    private final ComplaintRepository complaintRepository;
    private final TenantRepository tenantRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TenantComplaintResponse> getMyComplaints(Long userId) {
        Tenant tenant = tenantRepository.findByUserId(userId).orElse(null);
        if (tenant == null) {
            return List.of();
        }

        return complaintRepository.findByTenantId(tenant.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TenantComplaintResponse createComplaint(Long userId, TenantComplaintRequest request) {
        Tenant tenant = tenantRepository.findByUserId(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST, "Bạn chưa liên kết với phòng trọ nào để gửi khiếu nại"));

        Complaint complaint = Complaint.builder()
                .room(tenant.getRoom())
                .tenant(tenant)
                .title(request.getTitle())
                .content(request.getContent())
                .incidentType(request.getType())
                .severity(request.getUrgency() != null ? request.getUrgency() : "MEDIUM")
                .images(request.getImages())
                .status("PENDING")
                .build();

        Complaint saved = complaintRepository.save(complaint);
        log.info("Người thuê gửi khiếu nại thành công: id={}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantComplaintResponse getComplaintById(Long userId, Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy khiếu nại"));

        if (!complaint.getTenant().getUser().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền xem khiếu nại này");
        }

        return mapToResponse(complaint);
    }

    @Override
    @Transactional
    public void rateComplaint(Long userId, Long complaintId, RateComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy khiếu nại"));

        if (!complaint.getTenant().getUser().getId().equals(userId)) {
            throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền đánh giá khiếu nại này");
        }

        complaint.setRating(request.getRating());
        complaint.setFeedback(request.getFeedback());
        complaint.setResolutionNote((complaint.getResolutionNote() != null ? complaint.getResolutionNote() + " | " : "") +
                "Đánh giá của khách thuê: " + request.getRating() + " sao - " + (request.getFeedback() != null ? request.getFeedback() : ""));
        complaintRepository.save(complaint);
        log.info("Đánh giá chất lượng xử lý khiếu nại id={} thành công: {} sao", complaint.getId(), request.getRating());
    }

    private TenantComplaintResponse mapToResponse(Complaint c) {
        return TenantComplaintResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .content(c.getContent())
                .type(c.getIncidentType())
                .urgency(c.getSeverity())
                .status(c.getStatus())
                .responseNote(c.getResolutionNote())
                .rating(c.getRating())
                .feedback(c.getFeedback())
                .images(c.getImages())
                .createdAt(c.getCreatedAt())
                .resolvedAt(c.getResolvedAt())
                .build();
    }
}
