package com.doan.core.business.service.impl;

import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.dto.publicdto.PublicRoomSearchRequest;
import com.doan.core.business.entity.Room;
import com.doan.core.business.repository.RoomRepository;
import com.doan.core.business.service.PublicRoomService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicRoomServiceImpl implements PublicRoomService {

    private final RoomRepository roomRepository;

    @Override
    public PageResponse<RoomResponse> searchRooms(PublicRoomSearchRequest request) {
        int page = Math.max(0, request.getPage());
        int size = request.getSize() > 0 ? request.getSize() : 12;
        Pageable pageable = PageRequest.of(page, size);

        Page<Room> roomPage = roomRepository.searchPublicRooms(request, pageable);
        Page<RoomResponse> responsePage = roomPage.map(RoomResponse::fromEntity);
        return PageResponse.from(responsePage);
    }

    @Override
    public RoomResponse getRoomDetail(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy thông tin phòng trọ"));

        if (!Boolean.TRUE.equals(room.getIsPublic())) {
            throw new BaseException(ErrorCode.ROOM_NOT_FOUND, "Phòng trọ này hiện chưa được mở công khai");
        }

        return RoomResponse.fromEntity(room);
    }
}
