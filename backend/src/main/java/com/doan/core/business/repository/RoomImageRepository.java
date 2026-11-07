package com.doan.core.business.repository;

import com.doan.core.business.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    List<RoomImage> findByRoomIdOrderByDisplayOrderAsc(Long roomId);

    Optional<RoomImage> findByFileKey(String fileKey);

    List<RoomImage> findByImageHashIsNotNull();

    /**
     * Tìm tất cả hình ảnh đã có mã băm dHash thuộc về các CHỦ TRỌ KHÁC
     * Phục vụ đối soát chống sao chép, trộm ảnh giữa các chủ trọ
     */
    @Query("SELECT ri FROM RoomImage ri " +
           "JOIN ri.room r " +
           "LEFT JOIN r.building b " +
           "WHERE ((r.landlord IS NOT NULL AND r.landlord.id <> :landlordId) " +
           "   OR (b IS NOT NULL AND b.landlord.id <> :landlordId)) " +
           "AND ri.imageHash IS NOT NULL " +
           "AND (ri.deletedAt IS NULL)")
    List<RoomImage> findImagesOfOtherLandlords(@Param("landlordId") Long landlordId);

    /**
     * Tìm tất cả hình ảnh có mã băm dHash của các phòng khác (ngoại trừ roomId hiện tại)
     */
    @Query("SELECT ri FROM RoomImage ri " +
           "JOIN ri.room r " +
           "WHERE (:roomId IS NULL OR r.id <> :roomId) " +
           "AND ri.imageHash IS NOT NULL " +
           "AND (ri.deletedAt IS NULL)")
    List<RoomImage> findImagesOfOtherRooms(@Param("roomId") Long roomId);
}

