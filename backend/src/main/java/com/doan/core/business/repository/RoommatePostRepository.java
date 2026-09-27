package com.doan.core.business.repository;

import com.doan.core.business.entity.RoommatePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoommatePostRepository extends JpaRepository<RoommatePost, Long> {


    List<RoommatePost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT p FROM RoommatePost p WHERE p.status = 'OPEN' " +
           "AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.areaName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:district IS NULL OR LOWER(p.district) = LOWER(:district)) " +
           "AND (:postType IS NULL OR p.postType = :postType) " +
           "AND (:minPrice IS NULL OR p.sharePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.sharePrice <= :maxPrice) " +
           "ORDER BY p.createdAt DESC")
    Page<RoommatePost> searchPosts(
            @Param("keyword") String keyword,
            @Param("district") String district,
            @Param("postType") String postType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
}
