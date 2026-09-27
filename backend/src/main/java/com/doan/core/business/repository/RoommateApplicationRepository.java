package com.doan.core.business.repository;

import com.doan.core.business.entity.RoommateApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoommateApplicationRepository extends JpaRepository<RoommateApplication, Long> {

    List<RoommateApplication> findByPostIdOrderByCreatedAtDesc(Long postId);

    List<RoommateApplication> findByApplicantIdOrderByCreatedAtDesc(Long applicantId);

    Optional<RoommateApplication> findByPostIdAndApplicantId(Long postId, Long applicantId);

    boolean existsByPostIdAndApplicantIdAndStatus(Long postId, Long applicantId, String status);
}
