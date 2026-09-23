package com.doan.core.business.repository;

import com.doan.core.business.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndIsReadFalseAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalseAndDeletedAtIsNull(Long userId);
}
