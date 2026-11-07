package com.doan.core.business.repository;

import com.doan.core.business.entity.LandlordVerificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandlordVerificationDocumentRepository extends JpaRepository<LandlordVerificationDocument, Long> {

    Optional<LandlordVerificationDocument> findByFileKey(String fileKey);
}

