package com.doan.core.business.repository;

import com.doan.core.business.entity.UtilityService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilityServiceRepository extends JpaRepository<UtilityService, Long> {

    List<UtilityService> findByLandlordIdAndIsActiveTrue(Long landlordId);

    List<UtilityService> findByLandlordId(Long landlordId);

    Optional<UtilityService> findByIdAndLandlordId(Long id, Long landlordId);

    boolean existsByLandlordIdAndName(Long landlordId, String name);

    boolean existsByLandlordIdAndNameAndIdNot(Long landlordId, String name, Long id);
}
