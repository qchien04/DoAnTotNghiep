package com.doan.core.business.repository;

import com.doan.core.business.entity.Tenant;
import com.doan.core.business.enums.TenantLinkStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

       @Query("SELECT DISTINCT t FROM Tenant t JOIN t.contractTenants ct JOIN ct.contract c JOIN c.room r WHERE r.id = :roomId AND c.status = 'ACTIVE'")
       List<Tenant> findByRoomId(@Param("roomId") Long roomId);

       @Query("SELECT COUNT(ct) FROM ContractTenant ct WHERE ct.contract.id = :contractId")
       long countByContractId(@Param("contractId") Long contractId);

       @Query("SELECT COUNT(DISTINCT ct.tenant.id) FROM ContractTenant ct JOIN ct.contract c WHERE c.landlord.id = :landlordId AND c.status = 'ACTIVE'")
       long countActiveTenantsByLandlordId(@Param("landlordId") Long landlordId);

       List<Tenant> findAllByUserIdAndLinkStatus(Long userId, TenantLinkStatus linkStatus);

       @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Tenant t WHERE t.user.id = :userId AND t.landlord.id = :landlordId")
       boolean existsByUserIdAndLandlordId(@Param("userId") Long userId, @Param("landlordId") Long landlordId);

       @Query("SELECT DISTINCT t FROM Tenant t JOIN t.contractTenants ct JOIN ct.contract c JOIN c.room r LEFT JOIN r.building b "
                     +
                     "WHERE t.user.id = :userId AND t.linkStatus = :linkStatus AND c.status = 'ACTIVE' " +
                     "ORDER BY t.updatedAt DESC")
       List<Tenant> findActiveLinkedTenants(
                     @Param("userId") Long userId,
                     @Param("linkStatus") TenantLinkStatus linkStatus);

       @Query("SELECT CASE WHEN COUNT(ct) > 0 THEN true ELSE false END FROM ContractTenant ct " +
                     "JOIN ct.contract c WHERE ct.tenant.landlord.id = :landlordId AND ct.tenant.idCardNumber = :idCardNumber AND c.status = 'ACTIVE'")
       boolean existsActiveByLandlordIdAndIdCardNumber(@Param("landlordId") Long landlordId,
                     @Param("idCardNumber") String idCardNumber);

       @Query("SELECT CASE WHEN COUNT(ct) > 0 THEN true ELSE false END FROM ContractTenant ct " +
                     "JOIN ct.contract c WHERE ct.tenant.landlord.id = :landlordId AND ct.tenant.idCardNumber = :idCardNumber AND c.status = 'ACTIVE' AND ct.tenant.id <> :id")
       boolean existsActiveByLandlordIdAndIdCardNumberAndIdNot(@Param("landlordId") Long landlordId,
                     @Param("idCardNumber") String idCardNumber,
                     @Param("id") Long id);

       @Query("SELECT t FROM Tenant t WHERE t.id = :id AND t.landlord.id = :landlordId")
       Optional<Tenant> findByIdAndLandlordId(@Param("id") Long id, @Param("landlordId") Long landlordId);

       @Query("SELECT t FROM Tenant t WHERE t.id IN :ids AND t.landlord.id = :landlordId")
       List<Tenant> findAllByIdsAndLandlordId(@Param("ids") Collection<Long> ids, @Param("landlordId") Long landlordId);

       @Query(value = "SELECT DISTINCT t FROM Tenant t " +
                     "LEFT JOIN t.contractTenants ct " +
                     "LEFT JOIN ct.contract c " +
                     "LEFT JOIN c.room r " +
                     "LEFT JOIN r.building b " +
                     "WHERE t.landlord.id = :landlordId " +
                     "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
                     "AND (:roomId IS NULL OR (r IS NOT NULL AND r.id = :roomId)) " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     LOWER(t.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     LOWER(t.idCardNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     (r IS NOT NULL AND LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))))", countQuery = "SELECT COUNT(DISTINCT t) FROM Tenant t "
                                   +
                                   "LEFT JOIN t.contractTenants ct " +
                                   "LEFT JOIN ct.contract c " +
                                   "LEFT JOIN c.room r " +
                                   "LEFT JOIN r.building b " +
                                   "WHERE t.landlord.id = :landlordId " +
                                   "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
                                   "AND (:roomId IS NULL OR (r IS NOT NULL AND r.id = :roomId)) " +
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

}
