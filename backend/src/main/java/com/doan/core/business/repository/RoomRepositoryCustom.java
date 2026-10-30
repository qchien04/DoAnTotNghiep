package com.doan.core.business.repository;

import com.doan.core.business.dto.publicdto.PublicRoomSearchRequest;
import com.doan.core.business.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoomRepositoryCustom {
    Page<Room> searchPublicRooms(PublicRoomSearchRequest request, Pageable pageable);
}
