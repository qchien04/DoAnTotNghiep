package com.doan.core.business.repository;

import com.doan.core.business.entity.KycDocument;
import com.doan.core.business.entity.KycDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, Long> {

    Optional<KycDocument> findByFileKey(String fileKey);

    List<KycDocument> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<KycDocument> findByUserIdAndDocumentType(Long userId, KycDocumentType documentType);

    @Modifying
    @Query("DELETE FROM KycDocument k WHERE k.user.id = :userId AND k.documentType = :documentType")
    void deleteByUserIdAndDocumentType(@Param("userId") Long userId, @Param("documentType") KycDocumentType documentType);

    @Query("SELECT COUNT(k) > 0 FROM KycDocument k WHERE k.idCardNumber = :idCardNumber AND k.user.id <> :userId")
    boolean existsByIdCardNumberAndUserIdNot(@Param("idCardNumber") String idCardNumber, @Param("userId") Long userId);
}
