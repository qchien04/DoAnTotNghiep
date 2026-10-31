package com.doan.core.business.repository;

import com.doan.core.business.entity.Building;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    long countByLandlordId(Long landlordId);

    Optional<Building> findByIdAndLandlordId(Long id, Long landlordId);

    @Query("SELECT b FROM Building b WHERE b.landlord.id = :landlordId AND (" +
           "LOWER(b.name) LIKE :pattern OR " +
           "LOWER(b.addressDetail) LIKE :pattern)")
    List<Building> searchBuildings(@Param("landlordId") Long landlordId, 
                                   @Param("pattern") String pattern);

    @Query(value = "SELECT b FROM Building b WHERE b.landlord.id = :landlordId AND (" +
           ":keyword IS NULL OR :keyword = '' OR " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.addressDetail) LIKE LOWER(CONCAT('%', :keyword, '%')))",
           countQuery = "SELECT COUNT(b) FROM Building b WHERE b.landlord.id = :landlordId AND (" +
           ":keyword IS NULL OR :keyword = '' OR " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.addressDetail) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Building> filterBuildings(@Param("landlordId") Long landlordId,
                                   @Param("keyword") String keyword,
                                   Pageable pageable);

    @Query("SELECT r.building.id, COUNT(r), " +
           "SUM(CASE WHEN r.status = 'OCCUPIED' THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN r.status = 'AVAILABLE' THEN 1L ELSE 0L END) " +
           "FROM Room r WHERE r.building.landlord.id = :landlordId GROUP BY r.building.id")
    List<Object[]> getBuildingRoomStats(@Param("landlordId") Long landlordId);
}
