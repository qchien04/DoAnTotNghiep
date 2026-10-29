package com.doan.core.business.repository;

import com.doan.core.business.entity.Tenant;
import com.doan.core.business.enums.TenantLinkStatus;
import com.doan.core.business.enums.TenantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    List<Tenant> findAllByUserId(Long userId);

    List<Tenant> findAllByUserIdAndLinkStatus(Long userId, TenantLinkStatus linkStatus);

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.room r LEFT JOIN FETCH r.building b LEFT JOIN FETCH t.contract c " +
           "WHERE t.user.id = :userId AND t.linkStatus = :linkStatus AND t.status = :status AND t.room IS NOT NULL " +
           "ORDER BY t.updatedAt DESC")
    List<Tenant> findActiveLinkedTenants(
            @Param("userId") Long userId,
            @Param("linkStatus") TenantLinkStatus linkStatus,
            @Param("status") TenantStatus status);

    Optional<Tenant> findByIdCardNumber(String idCardNumber);

    boolean existsByIdCardNumberAndStatus(String idCardNumber, TenantStatus status);

    boolean existsByIdCardNumberAndStatusAndIdNot(String idCardNumber, TenantStatus status, Long id);

    @Query(value = "SELECT DISTINCT t FROM Tenant t " +
           "LEFT JOIN FETCH t.room r " +
           "LEFT JOIN FETCH r.building b " +
           "LEFT JOIN FETCH t.contract c " +
           "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId) OR (c IS NOT NULL AND c.landlord.id = :landlordId)) " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:roomId IS NULL OR r.id = :roomId) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(t.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(t.idCardNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (r IS NOT NULL AND LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))))",
           countQuery = "SELECT COUNT(DISTINCT t) FROM Tenant t " +
           "LEFT JOIN t.room r " +
           "LEFT JOIN r.building b " +
           "LEFT JOIN t.contract c " +
           "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId) OR (c IS NOT NULL AND c.landlord.id = :landlordId)) " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:roomId IS NULL OR r.id = :roomId) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(t.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(t.idCardNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (r IS NOT NULL AND LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<Tenant> filterTenants(@Param("landlordId") Long landlordId,
                               @Param("buildingId") Long buildingId,
                               @Param("roomId") Long roomId,
                               @Param("keyword") String keyword,
                               Pageable pageable);

    @Query("SELECT DISTINCT t FROM Tenant t " +
           "LEFT JOIN FETCH t.room r " +
           "LEFT JOIN FETCH r.building b " +
           "LEFT JOIN FETCH t.contract c " +
           "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId) OR (c IS NOT NULL AND c.landlord.id = :landlordId)) " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:roomId IS NULL OR r.id = :roomId) " +
           "AND (LOWER(t.fullName) LIKE :pattern " +
           "OR LOWER(t.phone) LIKE :pattern " +
           "OR LOWER(t.idCardNumber) LIKE :pattern) " +
           "ORDER BY t.id DESC")
    List<Tenant> searchTenantsWithPattern(@Param("landlordId") Long landlordId,
                                         @Param("buildingId") Long buildingId,
                                         @Param("roomId") Long roomId,
                                         @Param("pattern") String pattern);

    @Query("SELECT COUNT(t) FROM Tenant t LEFT JOIN t.room r LEFT JOIN r.building b LEFT JOIN t.contract c " +
           "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId) OR (c IS NOT NULL AND c.landlord.id = :landlordId)) " +
           "AND t.status = :status")
    long countByRoomBuildingLandlordIdAndStatus(@Param("landlordId") Long landlordId, @Param("status") TenantStatus status);
}
