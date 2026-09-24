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

    Optional<Complaint> findByIdAndRoomBuildingLandlordId(Long id, Long landlordId);

    @Query("SELECT DISTINCT c FROM Complaint c " +
           "JOIN FETCH c.room r " +
           "JOIN FETCH r.building b " +
           "JOIN FETCH c.tenant t " +
           "WHERE b.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR b.id = :buildingId) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "ORDER BY c.id DESC")
    List<Complaint> filterComplaints(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                     @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                                     @org.springframework.data.repository.query.Param("status") String status);

    long countByRoomBuildingLandlordIdAndStatus(Long landlordId, String status);
}
