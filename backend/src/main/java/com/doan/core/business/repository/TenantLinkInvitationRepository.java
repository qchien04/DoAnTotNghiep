package com.doan.core.business.repository;

import com.doan.core.business.entity.TenantLinkInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantLinkInvitationRepository extends JpaRepository<TenantLinkInvitation, Long> {

    List<TenantLinkInvitation> findByUserIdAndStatus(Long userId, String status);

    List<TenantLinkInvitation> findByTenantId(Long tenantId);

    Optional<TenantLinkInvitation> findByTenantIdAndUserIdAndStatus(Long tenantId, Long userId, String status);
}
