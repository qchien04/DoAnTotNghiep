package com.doan.core.business.repository;

import com.doan.core.business.entity.Room;
import com.doan.core.business.enums.RoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, RoomRepositoryCustom {

    List<Room> findByBuildingId(Long buildingId);

    List<Room> findByBuildingLandlordId(Long landlordId);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.building b WHERE r.id = :id AND " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId))")
    Optional<Room> findByIdAndBuildingLandlordId(@Param("id") Long id,
                                                 @Param("landlordId") Long landlordId);

    boolean existsByBuildingIdAndName(Long buildingId, String name);

    boolean existsByBuildingIdAndNameAndIdNot(Long buildingId, String name, Long id);

    boolean existsByBuildingIsNullAndLandlordIdAndName(Long landlordId, String name);

    boolean existsByBuildingIsNullAndLandlordIdAndNameAndIdNot(Long landlordId, String name, Long id);

    @Query(value = "SELECT r FROM Room r LEFT JOIN FETCH r.building b WHERE " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:floor IS NULL OR r.floor = :floor) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))))",
           countQuery = "SELECT COUNT(r) FROM Room r LEFT JOIN r.building b WHERE " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:floor IS NULL OR r.floor = :floor) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<Room> filterRooms(@Param("landlordId") Long landlordId,
                           @Param("buildingId") Long buildingId,
                           @Param("floor") Integer floor,
                           @Param("status") RoomStatus status,
                           @Param("keyword") String keyword,
                           Pageable pageable);

    long countByBuildingId(Long buildingId);

    long countByBuildingIdAndStatus(Long buildingId, RoomStatus status);

    @Query("SELECT COUNT(r) FROM Room r LEFT JOIN r.building b WHERE " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) " +
           "AND r.status = :status")
    long countByBuildingLandlordIdAndStatus(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                           @org.springframework.data.repository.query.Param("status") RoomStatus status);

    @Query("SELECT COUNT(r) FROM Room r LEFT JOIN r.building b WHERE " +
           "((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId))")
    long countByBuildingLandlordId(@org.springframework.data.repository.query.Param("landlordId") Long landlordId);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.building b " +
           "WHERE r.isPublic = true " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (r.moderationStatus = 'APPROVED' OR r.moderationStatus IS NULL) " +
           "ORDER BY r.id DESC")
    List<Room> findPublicRooms(@org.springframework.data.repository.query.Param("status") RoomStatus status);

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.building b " +
           "WHERE (:moderationStatus IS NULL OR r.moderationStatus = :moderationStatus) " +
           "AND (:minRiskScore IS NULL OR r.riskScore >= :minRiskScore) " +
           "ORDER BY r.riskScore DESC, r.id DESC")
    List<Room> findModerationRooms(@org.springframework.data.repository.query.Param("moderationStatus") String moderationStatus,
                                  @org.springframework.data.repository.query.Param("minRiskScore") Integer minRiskScore);
}
