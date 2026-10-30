package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.dto.publicdto.PublicRoomSearchRequest;
import com.doan.core.common.data.PageResponse;

public interface PublicRoomService {
    PageResponse<RoomResponse> searchRooms(PublicRoomSearchRequest request);
    RoomResponse getRoomDetail(Long id);
}
