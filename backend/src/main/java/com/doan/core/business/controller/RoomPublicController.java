package com.doan.core.business.controller;

import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.dto.publicdto.PublicRoomSearchRequest;
import com.doan.core.business.service.PublicRoomService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping({"/api/public/rooms", "/api/v1/public/rooms"})
@RequiredArgsConstructor
@Tag(name = "Tìm Kiếm Phòng Trọ Đa Chiều (Public)", description = "APIs tìm kiếm phòng trọ kèm khoanh vùng bản đồ và bộ lọc tiện ích")
public class RoomPublicController {

    private final PublicRoomService publicRoomService;

    @PostMapping("/search")
    @Operation(summary = "Tìm kiếm phòng trọ với bộ lọc đa chiều và các vùng khoanh tròn bản đồ (POST)")
    public ResponseEntity<ResponseData<PageResponse<RoomResponse>>> searchRooms(
            @RequestBody PublicRoomSearchRequest request) {
        PageResponse<RoomResponse> result = publicRoomService.searchRooms(request);
        return ResponseEntity.ok(ResponseData.success(result));
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm phòng trọ cơ bản qua URL Query Parameters (GET)")
    public ResponseEntity<ResponseData<PageResponse<RoomResponse>>> searchRoomsGet(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer wardId,
            @RequestParam(required = false) Integer amenitiesMask,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) BigDecimal minArea,
            @RequestParam(required = false) BigDecimal maxArea,
            @RequestParam(required = false) List<Long> amenityIds,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDirection) {

        PublicRoomSearchRequest request = PublicRoomSearchRequest.builder()
                .keyword(keyword)
                .provinceId(provinceId)
                .wardId(wardId)
                .amenitiesMask(amenitiesMask)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minArea(minArea)
                .maxArea(maxArea)
                .amenityIds(amenityIds)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        PageResponse<RoomResponse> result = publicRoomService.searchRooms(request);
        return ResponseEntity.ok(ResponseData.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem thông tin chi tiết phòng trọ công khai theo ID")
    public ResponseEntity<ResponseData<RoomResponse>> getRoomDetail(@PathVariable Long id) {
        RoomResponse response = publicRoomService.getRoomDetail(id);
        return ResponseEntity.ok(ResponseData.success(response));
    }
}
