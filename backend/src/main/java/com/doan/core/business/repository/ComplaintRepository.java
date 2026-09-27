package com.doan.core.business.repository;

import com.doan.core.business.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByRoomId(Long roomId);

    List<Complaint> findByTenantId(Long tenantId);

    @Query("SELECT c FROM Complaint c " +
           "JOIN FETCH c.room r " +
           "LEFT JOIN FETCH r.building b " +
           "JOIN FETCH c.tenant t " +
           "WHERE c.id = :id AND ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId))")
    Optional<Complaint> findByIdAndRoomBuildingLandlordId(@org.springframework.data.repository.query.Param("id") Long id,
                                                         @org.springframework.data.repository.query.Param("landlordId") Long landlordId);

    @Query("SELECT DISTINCT c FROM Complaint c " +
           "JOIN FETCH c.room r " +
           "LEFT JOIN FETCH r.building b " +
           "JOIN FETCH c.tenant t " +
           "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) " +
           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "ORDER BY c.id DESC")
    List<Complaint> filterComplaints(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                     @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                                     @org.springframework.data.repository.query.Param("status") String status);

    @Query("SELECT COUNT(c) FROM Complaint c JOIN c.room r LEFT JOIN r.building b " +
           "WHERE ((b IS NOT NULL AND b.landlord.id = :landlordId) OR (r.landlord IS NOT NULL AND r.landlord.id = :landlordId)) " +
           "AND c.status = :status")
    long countByRoomBuildingLandlordIdAndStatus(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                                @org.springframework.data.repository.query.Param("status") String status);
}
