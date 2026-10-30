package com.doan.core.business.repository;

import com.doan.core.business.entity.ContractTenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractTenantRepository extends JpaRepository<ContractTenant, Long> {

    List<ContractTenant> findByContractId(Long contractId);

    long countByContractId(Long contractId);

    Optional<ContractTenant> findByContractIdAndIsRepresentativeTrue(Long contractId);

    List<ContractTenant> findByTenantId(Long tenantId);

    Optional<ContractTenant> findByContractIdAndTenantId(Long contractId, Long tenantId);

    @Query("SELECT ct FROM ContractTenant ct JOIN FETCH ct.contract c WHERE ct.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    Optional<ContractTenant> findActiveByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT ct FROM ContractTenant ct JOIN FETCH ct.tenant t WHERE ct.contract.id = :contractId")
    List<ContractTenant> findByContractIdWithTenant(@Param("contractId") Long contractId);

    void deleteByContractId(Long contractId);
}
