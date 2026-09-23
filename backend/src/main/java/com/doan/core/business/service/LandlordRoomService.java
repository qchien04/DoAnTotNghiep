package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.landlord.room.RoomResponse;

import java.util.List;

public interface LandlordRoomService {

    List<RoomResponse> getRooms(Long landlordId, Long buildingId, Integer floor, String status);

    RoomResponse getRoomById(Long landlordId, Long roomId);

    RoomResponse createRoom(Long landlordId, RoomRequest request);

    RoomResponse updateRoom(Long landlordId, Long roomId, RoomRequest request);

    void deleteRoom(Long landlordId, Long roomId);
}
