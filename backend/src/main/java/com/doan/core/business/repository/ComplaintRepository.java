package com.doan.core.business.repository;

import com.doan.core.business.entity.Complaint;
import com.doan.core.business.enums.ComplaintSeverity;
import com.doan.core.business.enums.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

       @Query("SELECT c FROM Complaint c " +
                     "JOIN FETCH c.room r " +
                     "LEFT JOIN FETCH r.building b " +
                     "JOIN FETCH c.tenant t " +
                     "WHERE c.id = :id AND ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId))")
       Optional<Complaint> findByIdAndRoomBuildingLandlordId(
                     @Param("id") Long id,
                     @Param("landlordId") Long landlordId);

       @Query(value = "SELECT DISTINCT c FROM Complaint c " +
                     "JOIN FETCH c.room r " +
                     "LEFT JOIN FETCH r.building b " +
                     "JOIN FETCH c.tenant t " +
                     "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) "
                     +
                     "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
                     "AND (:status IS NULL OR c.status = :status) " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     (t IS NOT NULL AND LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))))", countQuery = "SELECT COUNT(DISTINCT c) FROM Complaint c "
                                   +
                                   "JOIN c.room r " +
                                   "LEFT JOIN r.building b " +
                                   "JOIN c.tenant t " +
                                   "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) "
                                   +
                                   "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
                                   "AND (:status IS NULL OR c.status = :status) " +
                                   "AND (:keyword IS NULL OR :keyword = '' OR " +
                                   "     LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "     LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "     (t IS NOT NULL AND LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
       Page<Complaint> filterComplaints(@Param("landlordId") Long landlordId,
                     @Param("buildingId") Long buildingId,
                     @Param("status") ComplaintStatus status,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       @Query(value = "SELECT DISTINCT c FROM Complaint c " +
                     "JOIN FETCH c.room r " +
                     "LEFT JOIN FETCH r.building b " +
                     "JOIN FETCH c.tenant t " +
                     "WHERE t.user.id = :userId " +
                     "AND (:status IS NULL OR c.status = :status) " +
                     "AND (:severity IS NULL OR c.severity = :severity) " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')))", countQuery = "SELECT COUNT(DISTINCT c) FROM Complaint c "
                                   +
                                   "JOIN c.room r " +
                                   "LEFT JOIN r.building b " +
                                   "JOIN c.tenant t " +
                                   "WHERE t.user.id = :userId " +
                                   "AND (:status IS NULL OR c.status = :status) " +
                                   "AND (:severity IS NULL OR c.severity = :severity) " +
                                   "AND (:keyword IS NULL OR :keyword = '' OR " +
                                   "     LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "     LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       Page<Complaint> filterTenantComplaints(@Param("userId") Long userId,
                     @Param("status") ComplaintStatus status,
                     @Param("severity") ComplaintSeverity severity,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       @Query("SELECT COUNT(c) FROM Complaint c JOIN c.room r LEFT JOIN r.building b " +
                     "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) "
                     +
                     "AND c.status = :status")
       long countByRoomBuildingLandlordIdAndStatus(
                     @Param("landlordId") Long landlordId,
                     @Param("status") ComplaintStatus status);
}
