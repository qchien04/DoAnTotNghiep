package com.doan.core.business.repository;

import com.doan.core.business.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    List<Building> findByLandlordIdAndIsActiveTrue(Long landlordId);

    List<Building> findByLandlordId(Long landlordId);

    Optional<Building> findByIdAndLandlordId(Long id, Long landlordId);

    boolean existsByBuildingCode(String buildingCode);

    boolean existsByBuildingCodeAndIdNot(String buildingCode, Long id);

    @Query("SELECT b FROM Building b WHERE b.landlord.id = :landlordId AND (" +
           "LOWER(b.name) LIKE :pattern OR " +
           "LOWER(b.addressDetail) LIKE :pattern OR " +
           "LOWER(b.buildingCode) LIKE :pattern)")
    List<Building> searchBuildings(@org.springframework.data.repository.query.Param("landlordId") Long landlordId, 
                                   @org.springframework.data.repository.query.Param("pattern") String pattern);
}
