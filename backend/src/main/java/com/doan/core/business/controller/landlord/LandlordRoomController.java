package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.enums.RoomStatus;
import com.doan.core.business.service.LandlordRoomService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/landlord/rooms")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "3. Chủ trọ - Quản lý Phòng trọ (UC 05 - 08)", description = "Xem danh sách phòng, lọc theo tòa/tầng/trạng thái, thêm, sửa, xóa phòng")
public class LandlordRoomController {

    private final LandlordRoomService roomService;

    @GetMapping
    @Operation(summary = "UC 05: Xem danh sách và trạng thái phòng trọ", description = "Lấy danh sách phòng theo tòa nhà, tầng, hoặc trạng thái (AVAILABLE, OCCUPIED, UNDER_MAINTENANCE) kèm tìm kiếm và sắp xếp")
    public ResponseEntity<ResponseData<PageResponse<RoomResponse>>> getRooms(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) Integer floor,
            @RequestParam(required = false) RoomStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection) {
        String query = (keyword != null && !keyword.isBlank()) ? keyword : search;
        PageResponse<RoomResponse> rooms = roomService.getRooms(principal.getId(), buildingId, floor, status, query,
                page, size, sortBy, sortDirection);
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
        return ResponseEntity.ok(ResponseData.success("Tạo phòng " + created.getName() + " thành công!", created));
    }

    @PostMapping(value = "/upload-images", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên ảnh phòng trọ (Tự động tính dHash và phát hiện trùng lặp ảnh)", description = "Lưu trữ ảnh riêng tư an toàn, tính mã băm perceptual hash và kiểm tra đối soát ảnh trùng với chủ trọ khác")
    public ResponseEntity<ResponseData<List<com.doan.core.business.dto.landlord.room.RoomImageUploadResponse>>> uploadImages(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("files") org.springframework.web.multipart.MultipartFile[] files) {
        List<com.doan.core.business.dto.landlord.room.RoomImageUploadResponse> responses = roomService.uploadRoomImages(principal.getId(), files);
        return ResponseEntity.ok(ResponseData.success("Tải lên và xử lý kiểm tra ảnh thành công!", responses));
    }

    @PutMapping("/{id}")
    @Operation(summary = "UC 07: Cập nhật thông tin phòng trọ", description = "Sửa đổi diện tích, giá thuê, tiện nghi, hoặc cập nhật trạng thái phòng")
    public ResponseEntity<ResponseData<RoomResponse>> updateRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request) {
        RoomResponse updated = roomService.updateRoom(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật phòng " + updated.getName() + " thành công!", updated));
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
