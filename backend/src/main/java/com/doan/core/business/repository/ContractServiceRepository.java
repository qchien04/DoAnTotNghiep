package com.doan.core.business.repository;

import com.doan.core.business.entity.ContractService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractServiceRepository extends JpaRepository<ContractService, Long> {

    List<ContractService> findByContractId(Long contractId);

    void deleteByContractId(Long contractId);
}
