package com.doan.core.business.controller.admin;

import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.dto.room.RoomAuditLogResponse;
import com.doan.core.business.dto.room.RoomModerationDetailResponse;
import com.doan.core.business.dto.room.RoomRiskEvaluationResult;
import com.doan.core.business.entity.Room;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.RoomRepository;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.RoomAuditLogService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import com.doan.core.common.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "17. Quản trị viên - Kiểm duyệt & Xử lý Rủi ro Phòng trọ", description = "Kiểm duyệt phòng chờ duyệt, xem điểm rủi ro, phát hiện trộm ảnh và xử lý phê duyệt/từ chối/khóa phòng")
public class AdminRoomModerationController {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomAuditLogService roomAuditLogService;
    private final ObjectMapper objectMapper;

    @GetMapping("/moderation")
    @Operation(summary = "Xem danh sách phòng trọ cần kiểm duyệt hoặc có rủi ro",
               description = "Lọc theo trạng thái kiểm duyệt (PENDING_REVIEW, REJECTED, LOCKED_STOLEN_IMAGES, APPROVED) và điểm rủi ro tối thiểu")
    public ResponseEntity<ResponseData<List<RoomResponse>>> getModerationRooms(
            @Parameter(description = "Trạng thái kiểm duyệt (PENDING_REVIEW, REJECTED, LOCKED_STOLEN_IMAGES, APPROVED)")
            @RequestParam(required = false) String moderationStatus,
            @Parameter(description = "Điểm rủi ro tối thiểu cần lọc (ví dụ 30)")
            @RequestParam(required = false) Integer minRiskScore) {

        List<Room> rooms = roomRepository.findModerationRooms(moderationStatus, minRiskScore);
        List<RoomResponse> responses = rooms.stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ResponseData.success("Lấy danh sách kiểm duyệt phòng trọ thành công", responses));
    }

    @GetMapping("/{id}/moderation-detail")
    @Operation(summary = "Xem chi tiết kiểm duyệt: Thông tin phòng, Điểm rủi ro từng dấu hiệu và Lịch sử chỉnh sửa",
               description = "Lấy đầy đủ thông tin phòng trọ, phân rã các dấu hiệu vi phạm và danh sách toàn bộ log audit chỉnh sửa")
    public ResponseEntity<ResponseData<RoomModerationDetailResponse>> getRoomModerationDetail(@PathVariable Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        RoomResponse roomResponse = RoomResponse.fromEntity(room);

        RoomRiskEvaluationResult riskEvaluation = null;
        if (room.getRiskEvaluationDetails() != null && !room.getRiskEvaluationDetails().isBlank()) {
            try {
                riskEvaluation = objectMapper.readValue(room.getRiskEvaluationDetails(), RoomRiskEvaluationResult.class);
            } catch (Exception e) {
                log.warn("Không thể giải mã riskEvaluationDetails của phòng ID: {}", id, e);
            }
        }

        List<RoomAuditLogResponse> auditLogs = roomAuditLogService.getRoomAuditLogs(id);

        RoomModerationDetailResponse detailResponse = RoomModerationDetailResponse.builder()
                .room(roomResponse)
                .riskEvaluation(riskEvaluation)
                .auditLogs(auditLogs)
                .build();

        return ResponseEntity.ok(ResponseData.success("Lấy chi tiết kiểm duyệt phòng trọ thành công", detailResponse));
    }

    @GetMapping("/{id}/audit-logs")
    @Operation(summary = "Xem lịch sử chỉnh sửa & kiểm duyệt của phòng trọ", description = "Lấy danh sách toàn bộ nhật ký thay đổi thông tin và quyết định kiểm duyệt")
    public ResponseEntity<ResponseData<List<RoomAuditLogResponse>>> getRoomAuditLogs(@PathVariable Long id) {
        List<RoomAuditLogResponse> auditLogs = roomAuditLogService.getRoomAuditLogs(id);
        return ResponseEntity.ok(ResponseData.success("Lấy nhật ký kiểm duyệt thành công", auditLogs));
    }

    @PostMapping("/{id}/approve")
    @Transactional
    @Operation(summary = "Phê duyệt tin đăng phòng trọ", description = "Chuyển trạng thái sang APPROVED, công khai lên sàn tìm kiếm và ghi audit log")
    public ResponseEntity<ResponseData<RoomResponse>> approveRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        User admin = userRepository.findById(principal.getId()).orElse(null);

        String oldStatus = room.getStatus();
        String oldModStatus = room.getModerationStatus();

        room.setModerationStatus("APPROVED");
        room.setModerationReason("Quản trị viên đã phê duyệt tin đăng hợp lệ");
        room.setStatus("AVAILABLE");
        room.setIsPublic(true);
        room.setModeratedAt(LocalDateTime.now());
        room.setModeratedBy(admin);

        Room saved = roomRepository.save(room);

        if (admin != null) {
            roomAuditLogService.logAction(
                    saved,
                    admin,
                    "MODERATION_APPROVED",
                    oldStatus,
                    saved.getStatus(),
                    oldModStatus,
                    saved.getModerationStatus(),
                    saved.getRiskScore(),
                    "Quản trị viên phê duyệt tin đăng hợp lệ",
                    "Phê duyệt công khai hiển thị trên toàn sàn",
                    null
            );
        }

        log.info("Admin ID [{}] đã phê duyệt phòng ID [{}]", principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Phê duyệt phòng trọ thành công!", RoomResponse.fromEntity(saved)));
    }

    @PostMapping("/{id}/reject")
    @Transactional
    @Operation(summary = "Từ chối tin đăng phòng trọ kèm lý do", description = "Chuyển trạng thái sang REJECTED, ẩn tin khỏi sàn tìm kiếm và ghi audit log")
    public ResponseEntity<ResponseData<RoomResponse>> rejectRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {

        String reason = (body != null && body.containsKey("reason") && !body.get("reason").isBlank())
                ? body.get("reason")
                : "Tin đăng vi phạm tiêu chuẩn cộng đồng hoặc có dấu hiệu rủi ro cao";

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        User admin = userRepository.findById(principal.getId()).orElse(null);

        String oldStatus = room.getStatus();
        String oldModStatus = room.getModerationStatus();

        room.setModerationStatus("REJECTED");
        room.setModerationReason(reason);
        room.setStatus("STOPPED");
        room.setIsPublic(false);
        room.setModeratedAt(LocalDateTime.now());
        room.setModeratedBy(admin);

        Room saved = roomRepository.save(room);

        if (admin != null) {
            roomAuditLogService.logAction(
                    saved,
                    admin,
                    "MODERATION_REJECTED",
                    oldStatus,
                    saved.getStatus(),
                    oldModStatus,
                    saved.getModerationStatus(),
                    saved.getRiskScore(),
                    reason,
                    "Quản trị viên từ chối tin đăng: " + reason,
                    null
            );
        }

        log.info("Admin ID [{}] đã từ chối phòng ID [{}], lý do: {}", principal.getId(), id, reason);
        return ResponseEntity.ok(ResponseData.success("Đã từ chối tin đăng phòng trọ!", RoomResponse.fromEntity(saved)));
    }

    @PostMapping("/{id}/unlock")
    @Transactional
    @Operation(summary = "Mở khóa phòng trọ bị khóa do bản quyền ảnh", description = "Cho phép Admin gỡ khóa sau khi xác minh tính chính chủ của hình ảnh và ghi audit log")
    public ResponseEntity<ResponseData<RoomResponse>> unlockRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND));

        User admin = userRepository.findById(principal.getId()).orElse(null);

        String oldStatus = room.getStatus();
        String oldModStatus = room.getModerationStatus();

        room.setModerationStatus("APPROVED");
        room.setModerationReason("Quản trị viên đã xác minh và mở khóa hình ảnh chính chủ");
        room.setStatus("AVAILABLE");
        room.setIsPublic(true);
        room.setModeratedAt(LocalDateTime.now());
        room.setModeratedBy(admin);

        Room saved = roomRepository.save(room);

        if (admin != null) {
            roomAuditLogService.logAction(
                    saved,
                    admin,
                    "MODERATION_UNLOCKED",
                    oldStatus,
                    saved.getStatus(),
                    oldModStatus,
                    saved.getModerationStatus(),
                    saved.getRiskScore(),
                    "Quản trị viên xác minh và mở khóa",
                    "Đã xác minh chính chủ và mở khóa hiển thị tin đăng",
                    null
            );
        }

        log.info("Admin ID [{}] đã mở khóa phòng ID [{}]", principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Đã mở khóa phòng trọ thành công!", RoomResponse.fromEntity(saved)));
    }
}

