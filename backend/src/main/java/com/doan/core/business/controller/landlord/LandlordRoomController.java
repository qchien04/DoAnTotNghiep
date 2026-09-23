package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.service.LandlordRoomService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/landlord/rooms")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "3. Chủ trọ - Quản lý Phòng trọ (UC 05 - 08)", description = "Xem danh sách phòng, lọc theo tòa/tầng/trạng thái, thêm, sửa, xóa phòng")
public class LandlordRoomController {

    private final LandlordRoomService roomService;

    @GetMapping
    @Operation(summary = "UC 05: Xem danh sách và trạng thái phòng trọ", description = "Lấy danh sách phòng theo tòa nhà, tầng, hoặc trạng thái (AVAILABLE, OCCUPIED, UNDER_MAINTENANCE)")
    public ResponseEntity<ResponseData<List<RoomResponse>>> getRooms(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) Integer floor,
            @RequestParam(required = false) String status) {
        List<RoomResponse> rooms = roomService.getRooms(principal.getId(), buildingId, floor, status);
        return ResponseEntity.ok(ResponseData.success(rooms));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết phòng trọ", description = "Lấy thông tin chi tiết phòng trọ theo ID")
    public ResponseEntity<ResponseData<RoomResponse>> getRoomById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        RoomResponse room = roomService.getRoomById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(room));
    }

    @PostMapping
    @Operation(summary = "UC 06: Thêm phòng trọ mới", description = "Khởi tạo phòng trọ mới với trạng thái mặc định Còn trống (AVAILABLE)")
    public ResponseEntity<ResponseData<RoomResponse>> createRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RoomRequest request) {
        RoomResponse created = roomService.createRoom(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Tạo phòng " + created.getRoomCode() + " thành công!", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "UC 07: Cập nhật thông tin phòng trọ", description = "Sửa đổi diện tích, giá thuê, tiện nghi, hoặc cập nhật trạng thái phòng")
    public ResponseEntity<ResponseData<RoomResponse>> updateRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request) {
        RoomResponse updated = roomService.updateRoom(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật phòng " + updated.getRoomCode() + " thành công!", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "UC 08: Xóa phòng trọ", description = "Xóa phòng trọ nếu chưa từng phát sinh hợp đồng hoặc hóa đơn")
    public ResponseEntity<ResponseData<Void>> deleteRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        roomService.deleteRoom(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success("Xóa phòng thành công!", null));
    }
}
