package com.doan.core.business.repository;

import com.doan.core.business.entity.Invoice;
import com.doan.core.business.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByIdAndContractLandlordId(Long id, Long landlordId);

    boolean existsByContractIdAndBillingPeriodAndStatusNot(Long contractId, String billingPeriod, InvoiceStatus status);

    @Query(value = "SELECT DISTINCT i FROM Invoice i " +
           "JOIN FETCH i.contract c " +
           "JOIN FETCH c.room r " +
           "LEFT JOIN FETCH r.building b " +
           "LEFT JOIN FETCH c.representativeTenant t " +
           "WHERE c.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:billingPeriod IS NULL OR i.billingPeriod = :billingPeriod) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "     (t IS NOT NULL AND (LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR t.phone LIKE CONCAT('%', :keyword, '%'))) OR " +
           "     CONCAT('INV', i.id) LIKE CONCAT('%', :keyword, '%'))",
           countQuery = "SELECT COUNT(DISTINCT i) FROM Invoice i " +
           "JOIN i.contract c " +
           "JOIN c.room r " +
           "LEFT JOIN r.building b " +
           "LEFT JOIN c.representativeTenant t " +
           "WHERE c.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:billingPeriod IS NULL OR i.billingPeriod = :billingPeriod) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "     (t IS NOT NULL AND (LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR t.phone LIKE CONCAT('%', :keyword, '%'))) OR " +
           "     CONCAT('INV', i.id) LIKE CONCAT('%', :keyword, '%'))")
    Page<Invoice> filterInvoices(@Param("landlordId") Long landlordId,
                                 @Param("buildingId") Long buildingId,
                                 @Param("billingPeriod") String billingPeriod,
                                 @Param("status") InvoiceStatus status,
                                 @Param("keyword") String keyword,
                                 Pageable pageable);

    @Query(value = "SELECT DISTINCT i FROM Invoice i " +
           "JOIN FETCH i.contract c " +
           "JOIN c.tenants tn " +
           "JOIN FETCH c.room r " +
           "LEFT JOIN FETCH r.building b " +
           "LEFT JOIN FETCH c.representativeTenant t " +
           "WHERE tn.user.id = :userId " +
           "AND tn.linkStatus = com.doan.core.business.enums.TenantLinkStatus.LINKED " +
           "AND i.status <> com.doan.core.business.enums.InvoiceStatus.DRAFT " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:billingPeriod IS NULL OR i.billingPeriod = :billingPeriod) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "     LOWER(i.billingPeriod) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     CONCAT('INV', i.id) LIKE CONCAT('%', :keyword, '%') OR " +
           "     CONCAT('HD', i.id) LIKE CONCAT('%', :keyword, '%'))",
           countQuery = "SELECT COUNT(DISTINCT i) FROM Invoice i " +
           "JOIN i.contract c " +
           "JOIN c.tenants tn " +
           "JOIN c.room r " +
           "LEFT JOIN r.building b " +
           "LEFT JOIN c.representativeTenant t " +
           "WHERE tn.user.id = :userId " +
           "AND tn.linkStatus = com.doan.core.business.enums.TenantLinkStatus.LINKED " +
           "AND i.status <> com.doan.core.business.enums.InvoiceStatus.DRAFT " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:billingPeriod IS NULL OR i.billingPeriod = :billingPeriod) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "     LOWER(i.billingPeriod) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     CONCAT('INV', i.id) LIKE CONCAT('%', :keyword, '%') OR " +
           "     CONCAT('HD', i.id) LIKE CONCAT('%', :keyword, '%'))")
    Page<Invoice> filterTenantInvoices(@Param("userId") Long userId,
                                       @Param("status") InvoiceStatus status,
                                       @Param("billingPeriod") String billingPeriod,
                                       @Param("keyword") String keyword,
                                       Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.contract.id = :contractId ORDER BY i.id DESC")
    List<Invoice> findLatestByContractId(@Param("contractId") Long contractId);

    long countByContractLandlordIdAndStatus(Long landlordId, InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.contract.landlord.id = :landlordId AND i.billingPeriod = :billingPeriod")
    Long sumRevenueByLandlordAndPeriod(@Param("landlordId") Long landlordId,
                                       @Param("billingPeriod") String billingPeriod);
}
