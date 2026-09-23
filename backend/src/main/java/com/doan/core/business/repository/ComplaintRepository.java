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

    @Query("SELECT c FROM Complaint c WHERE c.room.building.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR c.room.building.id = :buildingId) " +
           "AND (:status IS NULL OR c.status = :status)")
    List<Complaint> filterComplaints(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                     @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                                     @org.springframework.data.repository.query.Param("status") String status);

    long countByRoomBuildingLandlordIdAndStatus(Long landlordId, String status);
}
