package com.doan.core.business.repository;

import com.doan.core.business.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByContractId(Long contractId);

    Optional<Invoice> findByIdAndContractLandlordId(Long id, Long landlordId);

    boolean existsByInvoiceCode(String invoiceCode);

    boolean existsByContractIdAndBillingPeriodAndStatusNot(Long contractId, String billingPeriod, String status);

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "JOIN FETCH i.contract c " +
           "JOIN FETCH c.room r " +
           "JOIN FETCH r.building b " +
           "LEFT JOIN FETCH c.representativeTenant t " +
           "WHERE c.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR b.id = :buildingId) " +
           "AND (:billingPeriod IS NULL OR i.billingPeriod = :billingPeriod) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "ORDER BY i.id DESC")
    List<Invoice> filterInvoices(@Param("landlordId") Long landlordId,
                                 @Param("buildingId") Long buildingId,
                                 @Param("billingPeriod") String billingPeriod,
                                 @Param("status") String status);

    @Query("SELECT i FROM Invoice i WHERE i.contract.id = :contractId ORDER BY i.id DESC")
    List<Invoice> findLatestByContractId(@Param("contractId") Long contractId);

    long countByContractLandlordIdAndStatus(Long landlordId, String status);

    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.contract.landlord.id = :landlordId AND i.billingPeriod = :billingPeriod")
    Long sumRevenueByLandlordAndPeriod(@Param("landlordId") Long landlordId,
                                       @Param("billingPeriod") String billingPeriod);
}
