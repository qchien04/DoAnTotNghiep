package com.doan.core.business.repository;

import com.doan.core.business.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByBuildingId(Long buildingId);

    List<Room> findByBuildingLandlordId(Long landlordId);

    Optional<Room> findByIdAndBuildingLandlordId(Long id, Long landlordId);

    boolean existsByBuildingIdAndRoomCode(Long buildingId, String roomCode);

    boolean existsByBuildingIdAndRoomCodeAndIdNot(Long buildingId, String roomCode, Long id);

    @Query("SELECT r FROM Room r WHERE r.building.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR r.building.id = :buildingId) " +
           "AND (:floor IS NULL OR r.floor = :floor) " +
           "AND (:status IS NULL OR r.status = :status)")
    List<Room> filterRooms(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                           @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                           @org.springframework.data.repository.query.Param("floor") Integer floor,
                           @org.springframework.data.repository.query.Param("status") String status);

    long countByBuildingId(Long buildingId);

    long countByBuildingIdAndStatus(Long buildingId, String status);

    long countByBuildingLandlordIdAndStatus(Long landlordId, String status);

    long countByBuildingLandlordId(Long landlordId);
}
