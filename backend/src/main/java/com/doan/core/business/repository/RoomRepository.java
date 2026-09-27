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

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.building b WHERE r.id = :id AND " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId))")
    Optional<Room> findByIdAndBuildingLandlordId(@org.springframework.data.repository.query.Param("id") Long id,
                                                 @org.springframework.data.repository.query.Param("landlordId") Long landlordId);

    boolean existsByBuildingIdAndName(Long buildingId, String name);

    boolean existsByBuildingIdAndNameAndIdNot(Long buildingId, String name, Long id);

    boolean existsByBuildingIsNullAndLandlordIdAndName(Long landlordId, String name);

    boolean existsByBuildingIsNullAndLandlordIdAndNameAndIdNot(Long landlordId, String name, Long id);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.building b WHERE " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:floor IS NULL OR r.floor = :floor) " +
           "AND (:status IS NULL OR r.status = :status)")
    List<Room> filterRooms(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                           @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                           @org.springframework.data.repository.query.Param("floor") Integer floor,
                           @org.springframework.data.repository.query.Param("status") String status);

    long countByBuildingId(Long buildingId);

    long countByBuildingIdAndStatus(Long buildingId, String status);

    @Query("SELECT COUNT(r) FROM Room r LEFT JOIN r.building b WHERE " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) " +
           "AND r.status = :status")
    long countByBuildingLandlordIdAndStatus(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                           @org.springframework.data.repository.query.Param("status") String status);

    @Query("SELECT COUNT(r) FROM Room r LEFT JOIN r.building b WHERE " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId))")
    long countByBuildingLandlordId(@org.springframework.data.repository.query.Param("landlordId") Long landlordId);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.building b WHERE r.isPublic = true AND (:status IS NULL OR r.status = :status) ORDER BY r.id DESC")
    List<Room> findPublicRooms(@org.springframework.data.repository.query.Param("status") String status);
}
