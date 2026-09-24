package com.doan.core.business.repository;

import com.doan.core.business.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    boolean existsByIdCardNumberAndStatusAndIdNot(String idCardNumber, String status, Long id);

    @Query("SELECT DISTINCT t FROM Tenant t " +
           "LEFT JOIN FETCH t.room r " +
           "LEFT JOIN FETCH r.building b " +
           "LEFT JOIN FETCH t.contract c " +
           "WHERE (r.building.landlord.id = :landlordId OR c.landlord.id = :landlordId) " +
           "AND (:buildingId IS NULL OR b.id = :buildingId) " +
           "AND (:roomId IS NULL OR r.id = :roomId) " +
           "ORDER BY t.id DESC")
    List<Tenant> filterTenants(@Param("landlordId") Long landlordId,
                               @Param("buildingId") Long buildingId,
                               @Param("roomId") Long roomId);

    @Query("SELECT DISTINCT t FROM Tenant t " +
           "LEFT JOIN FETCH t.room r " +
           "LEFT JOIN FETCH r.building b " +
           "LEFT JOIN FETCH t.contract c " +
           "WHERE (r.building.landlord.id = :landlordId OR c.landlord.id = :landlordId) " +
           "AND (:buildingId IS NULL OR b.id = :buildingId) " +
           "AND (:roomId IS NULL OR r.id = :roomId) " +
           "AND (LOWER(t.fullName) LIKE :pattern " +
           "OR LOWER(t.phone) LIKE :pattern " +
           "OR LOWER(t.idCardNumber) LIKE :pattern) " +
           "ORDER BY t.id DESC")
    List<Tenant> searchTenantsWithPattern(@Param("landlordId") Long landlordId,
                                         @Param("buildingId") Long buildingId,
                                         @Param("roomId") Long roomId,
                                         @Param("pattern") String pattern);

    long countByRoomBuildingLandlordIdAndStatus(Long landlordId, String status);
}
