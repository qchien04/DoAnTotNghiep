package com.doan.core.business.repository;

import com.doan.core.business.entity.LandlordVerification;
import com.doan.core.business.entity.LandlordVerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LandlordVerificationRepository extends JpaRepository<LandlordVerification, Long> {

    Optional<LandlordVerification> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    List<LandlordVerification> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT v FROM LandlordVerification v WHERE " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(v.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.user.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.propertyAddress) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.documentNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<LandlordVerification> searchVerifications(@Param("status") LandlordVerificationStatus status,
                                                   @Param("keyword") String keyword,
                                                   Pageable pageable);

    long countByStatus(LandlordVerificationStatus status);
}

