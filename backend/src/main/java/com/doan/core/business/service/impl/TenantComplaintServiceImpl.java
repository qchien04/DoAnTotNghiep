package com.doan.core.business.service.impl;

import com.doan.core.business.dto.tenant.RateComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintRequest;
import com.doan.core.business.dto.tenant.TenantComplaintResponse;
import com.doan.core.business.entity.Complaint;
import com.doan.core.business.entity.ContractTenant;
import com.doan.core.business.entity.Room;
import com.doan.core.business.enums.*;
import com.doan.core.business.entity.Tenant;
import com.doan.core.business.repository.ComplaintRepository;
import com.doan.core.business.repository.TenantRepository;
import com.doan.core.business.service.TenantComplaintService;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantComplaintServiceImpl implements TenantComplaintService {

        private final ComplaintRepository complaintRepository;
        private final TenantRepository tenantRepository;

        @Override
        @Transactional(readOnly = true)
        public PageResponse<TenantComplaintResponse> getMyComplaints(Long userId, String keyword,
                        ComplaintStatus status,
                        ComplaintSeverity severity, int page, int size, String sortBy, String sortDirection) {
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
                Sort sort = Sort.by(direction, sortProperty);

                int pageNumber = Math.max(0, page);
                int pageSize = size > 0 ? size : 10;
                Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

                log.info(
                                "Lấy danh sách khiếu nại của người thuê userId: {}, status: {}, severity: {}, keyword: {}, pageable: {}",
                                userId, status, severity, kw, pageable);
                Page<Complaint> complaints = complaintRepository.filterTenantComplaints(userId, status, severity, kw,
                                pageable);
                Page<TenantComplaintResponse> dtoPage = complaints.map(this::mapToResponse);
                return PageResponse.from(dtoPage);
        }

        @Override
        @Transactional
        public TenantComplaintResponse createComplaint(Long userId, TenantComplaintRequest request) {
                if (request.getTitle() == null || request.getTitle().trim().isBlank()) {
                        throw new BaseException(ErrorCode.BAD_REQUEST, "Tiêu đề khiếu nại không được để trống");
                }
                if (request.getContent() == null || request.getContent().trim().isBlank()) {
                        throw new BaseException(ErrorCode.BAD_REQUEST, "Nội dung phản ánh không được để trống");
                }

                Tenant tenant = tenantRepository.findActiveLinkedTenants(userId, TenantLinkStatus.LINKED)
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new BaseException(ErrorCode.BAD_REQUEST,
                                                "Bạn chưa có phòng trọ đang thuê hiệu lực để gửi khiếu nại"));

                ContractTenant activeCt = (tenant.getContractTenants() != null)
                                ? tenant.getContractTenants().stream()
                                                .filter(ct -> ct.getContract() != null && ct.getContract()
                                                                .getStatus() == ContractStatus.ACTIVE)
                                                .findFirst()
                                                .orElse(null)
                                : null;
                Room room = (activeCt != null && activeCt.getContract() != null)
                                ? activeCt.getContract().getRoom()
                                : null;

                ComplaintIncidentType incType = request.getType() != null ? request.getType()
                                : ComplaintIncidentType.OTHER;
                ComplaintSeverity sev = request.getUrgency() != null ? request.getUrgency() : ComplaintSeverity.MEDIUM;

                Complaint complaint = Complaint.builder()
                                .room(room)
                                .tenant(tenant)
                                .title(request.getTitle().trim())
                                .content(request.getContent().trim())
                                .incidentType(incType)
                                .severity(sev)
                                .images(request.getImages())
                                .status(ComplaintStatus.PENDING)
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

                if (complaint.getTenant() == null || complaint.getTenant().getUser() == null
                                || !complaint.getTenant().getUser().getId().equals(userId)) {
                        throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền xem khiếu nại này");
                }

                return mapToResponse(complaint);
        }

        @Override
        @Transactional
        public void rateComplaint(Long userId, Long complaintId, RateComplaintRequest request) {
                Complaint complaint = complaintRepository.findById(complaintId)
                                .orElseThrow(() -> new BaseException(ErrorCode.NOT_FOUND, "Không tìm thấy khiếu nại"));

                if (complaint.getTenant() == null || complaint.getTenant().getUser() == null
                                || !complaint.getTenant().getUser().getId().equals(userId)) {
                        throw new BaseException(ErrorCode.FORBIDDEN, "Bạn không có quyền đánh giá khiếu nại này");
                }

                if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
                        throw new BaseException(ErrorCode.BAD_REQUEST,
                                        "Chỉ có thể đánh giá khiếu nại sau khi đã được chủ trọ xử lý xong (RESOLVED)");
                }

                if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
                        throw new BaseException(ErrorCode.BAD_REQUEST, "Điểm đánh giá phải từ 1 đến 5 sao");
                }

                complaint.setRating(request.getRating());
                complaint.setFeedback(request.getFeedback());
                complaint.setResolutionNote(
                                (complaint.getResolutionNote() != null ? complaint.getResolutionNote() + " | " : "") +
                                                "Đánh giá của khách thuê: " + request.getRating() + " sao - "
                                                + (request.getFeedback() != null ? request.getFeedback() : ""));
                complaintRepository.save(complaint);
                log.info("Đánh giá chất lượng xử lý khiếu nại id={} thành công: {} sao", complaint.getId(),
                                request.getRating());
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
