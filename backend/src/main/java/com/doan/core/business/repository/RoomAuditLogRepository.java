package com.doan.core.business.repository;

import com.doan.core.business.entity.RoomAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomAuditLogRepository extends JpaRepository<RoomAuditLog, Long> {

    @Query("SELECT l FROM RoomAuditLog l " +
           "LEFT JOIN FETCH l.actor a " +
           "LEFT JOIN FETCH l.room r " +
           "WHERE l.room.id = :roomId " +
           "ORDER BY l.createdAt DESC")
    List<RoomAuditLog> findByRoomIdOrderByCreatedAtDesc(@Param("roomId") Long roomId);
}

