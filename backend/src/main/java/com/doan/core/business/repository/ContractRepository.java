package com.doan.core.business.repository;

import com.doan.core.business.entity.Contract;
import com.doan.core.business.enums.ContractStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

       List<Contract> findByRoomId(Long roomId);

       Optional<Contract> findByRoomIdAndStatus(Long roomId, ContractStatus status);

       Optional<Contract> findByIdAndLandlordId(Long id, Long landlordId);

       @Query("SELECT DISTINCT c FROM Contract c " +
              "JOIN FETCH c.room r " +
              "LEFT JOIN FETCH r.building b " +
              "LEFT JOIN FETCH c.contractTenants ct " +
              "LEFT JOIN FETCH ct.tenant t " +
              "LEFT JOIN FETCH t.user u " +
              "WHERE c.id = :id AND c.landlord.id = :landlordId")
       Optional<Contract> findByIdAndLandlordIdWithDetails(@Param("id") Long id, @Param("landlordId") Long landlordId);

       boolean existsByRoomIdAndStatus(Long roomId, ContractStatus status);

       @Query(value = "SELECT DISTINCT c FROM Contract c " +
                     "JOIN FETCH c.room r " +
                     "LEFT JOIN FETCH r.building b " +
                     "LEFT JOIN FETCH c.contractTenants ct " +
                     "LEFT JOIN FETCH ct.tenant t " +
                     "WHERE c.landlord.id = :landlordId " +
                     "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
                     "AND (:status IS NULL OR c.status = :status) " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                     "     (t IS NOT NULL AND (LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR t.phone LIKE CONCAT('%', :keyword, '%'))) OR " +
                     "     CONCAT('HD', c.id) LIKE CONCAT('%', :keyword, '%'))",
              countQuery = "SELECT COUNT(DISTINCT c) FROM Contract c " +
                           "JOIN c.room r " +
                           "LEFT JOIN r.building b " +
                           "LEFT JOIN c.contractTenants ct " +
                           "LEFT JOIN ct.tenant t " +
                           "WHERE c.landlord.id = :landlordId " +
                           "AND (:buildingId IS NULL OR (b IS NOT NULL AND b.id = :buildingId)) " +
                           "AND (:status IS NULL OR c.status = :status) " +
                           "AND (:keyword IS NULL OR :keyword = '' OR " +
                           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                           "     (t IS NOT NULL AND (LOWER(t.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR t.phone LIKE CONCAT('%', :keyword, '%'))) OR " +
                           "     CONCAT('HD', c.id) LIKE CONCAT('%', :keyword, '%'))")
       Page<Contract> filterContracts(@Param("landlordId") Long landlordId,
                     @Param("buildingId") Long buildingId,
                     @Param("status") ContractStatus status,
                     @Param("keyword") String keyword,
                     Pageable pageable);


       @Query(value = "SELECT DISTINCT c FROM Contract c " +
                     "JOIN c.contractTenants ct " +
                     "JOIN ct.tenant tn " +
                     "JOIN FETCH c.room r " +
                     "LEFT JOIN FETCH r.building b " +
                     "LEFT JOIN FETCH c.landlord l " +
                     "WHERE tn.user.id = :userId " +
                     "AND (:status IS NULL OR c.status = :status) " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                     "     (l IS NOT NULL AND (LOWER(l.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR l.phone LIKE CONCAT('%', :keyword, '%'))) OR " +
                     "     CONCAT('HD', c.id) LIKE CONCAT('%', :keyword, '%'))",
              countQuery = "SELECT COUNT(DISTINCT c) FROM Contract c " +
                           "JOIN c.contractTenants ct " +
                           "JOIN ct.tenant tn " +
                           "JOIN c.room r " +
                           "LEFT JOIN r.building b " +
                           "LEFT JOIN c.landlord l " +
                           "WHERE tn.user.id = :userId " +
                           "AND (:status IS NULL OR c.status = :status) " +
                           "AND (:keyword IS NULL OR :keyword = '' OR " +
                           "     LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                           "     (b IS NOT NULL AND LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                           "     (l IS NOT NULL AND (LOWER(l.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR l.phone LIKE CONCAT('%', :keyword, '%'))) OR " +
                           "     CONCAT('HD', c.id) LIKE CONCAT('%', :keyword, '%'))")
       Page<Contract> filterTenantContracts(@Param("userId") Long userId,
                     @Param("status") ContractStatus status,
                     @Param("keyword") String keyword,
                     Pageable pageable);
}
