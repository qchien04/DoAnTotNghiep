package com.doan.core.business.repository;

import com.doan.core.business.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findByLandlordId(Long landlordId);

    List<Contract> findByRoomId(Long roomId);

    Optional<Contract> findByRoomIdAndStatus(Long roomId, String status);

    Optional<Contract> findByIdAndLandlordId(Long id, Long landlordId);

    boolean existsByContractCode(String contractCode);

    boolean existsByRoomIdAndStatus(Long roomId, String status);

    boolean existsByRepresentativeTenantIdAndStatus(Long representativeTenantId, String status);

    @Query("SELECT c FROM Contract c WHERE c.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR c.room.building.id = :buildingId) " +
           "AND (:status IS NULL OR c.status = :status)")
    List<Contract> filterContracts(@org.springframework.data.repository.query.Param("landlordId") Long landlordId,
                                   @org.springframework.data.repository.query.Param("buildingId") Long buildingId,
                                   @org.springframework.data.repository.query.Param("status") String status);

    long countByLandlordIdAndStatus(Long landlordId, String status);
}
