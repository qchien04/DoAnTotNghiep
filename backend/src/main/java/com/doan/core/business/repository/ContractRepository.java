package com.doan.core.business.repository;

import com.doan.core.business.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT DISTINCT c FROM Contract c " +
           "JOIN FETCH c.room r " +
           "JOIN FETCH r.building b " +
           "LEFT JOIN FETCH c.representativeTenant t " +
           "WHERE c.landlord.id = :landlordId " +
           "AND (:buildingId IS NULL OR b.id = :buildingId) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "ORDER BY c.id DESC")
    List<Contract> filterContracts(@Param("landlordId") Long landlordId,
                                   @Param("buildingId") Long buildingId,
                                   @Param("status") String status);

    long countByLandlordIdAndStatus(Long landlordId, String status);
}
