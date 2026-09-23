package com.doan.core.business.repository;

import com.doan.core.business.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    List<Tenant> findByRoomId(Long roomId);

    List<Tenant> findByContractId(Long contractId);

    Optional<Tenant> findByUserId(Long userId);

    Optional<Tenant> findByIdCardNumber(String idCardNumber);

    boolean existsByIdCardNumberAndStatus(String idCardNumber, String status);

    @Query("SELECT t FROM Tenant t WHERE t.room.building.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR t.room.building.id = :buildingId) " +
           "AND (:roomId IS NULL OR t.room.id = :roomId)")
    List<Tenant> filterTenants(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                               @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                               @org.springframework.data.repository.query.Param("roomId") Long roomId);

    @Query("SELECT t FROM Tenant t WHERE t.room.building.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR t.room.building.id = :buildingId) " +
           "AND (:roomId IS NULL OR t.room.id = :roomId) " +
           "AND (LOWER(t.fullName) LIKE :pattern " +
           "OR LOWER(t.phone) LIKE :pattern " +
           "OR LOWER(t.idCardNumber) LIKE :pattern)")
    List<Tenant> searchTenantsWithPattern(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                         @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                                         @org.springframework.data.repository.query.Param("roomId") Long roomId,
                                         @org.springframework.data.repository.query.Param("pattern") String pattern);

    long countByRoomBuildingLandlordIdAndStatus(Long landlordId, String status);
}
