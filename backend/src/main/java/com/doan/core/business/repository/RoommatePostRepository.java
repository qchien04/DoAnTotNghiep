package com.doan.core.business.repository;

import com.doan.core.business.entity.RoommatePost;
import com.doan.core.business.enums.RoommatePostStatus;
import com.doan.core.business.enums.RoommatePostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RoommatePostRepository extends JpaRepository<RoommatePost, Long> {

       List<RoommatePost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

       @Query(value = "SELECT p FROM RoommatePost p WHERE p.author.id = :authorId " +
                     "AND (:status IS NULL OR p.status = :status) " +
                     "AND (:postType IS NULL OR p.postType = :postType) " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     (p.areaName IS NOT NULL AND LOWER(p.areaName) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                     "     (p.district IS NOT NULL AND LOWER(p.district) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                     "     CONCAT('POST', p.id) LIKE CONCAT('%', :keyword, '%'))", countQuery = "SELECT COUNT(p) FROM RoommatePost p WHERE p.author.id = :authorId "
                                   +
                                   "AND (:status IS NULL OR p.status = :status) " +
                                   "AND (:postType IS NULL OR p.postType = :postType) " +
                                   "AND (:keyword IS NULL OR :keyword = '' OR " +
                                   "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "     LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "     (p.areaName IS NOT NULL AND LOWER(p.areaName) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR "
                                   +
                                   "     (p.district IS NOT NULL AND LOWER(p.district) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR "
                                   +
                                   "     CONCAT('POST', p.id) LIKE CONCAT('%', :keyword, '%'))")
       Page<RoommatePost> filterAuthorPosts(@Param("authorId") Long authorId,
                     @Param("status") RoommatePostStatus status,
                     @Param("postType") RoommatePostType postType,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       @Query(value = "SELECT p FROM RoommatePost p WHERE p.status = com.doan.core.business.enums.RoommatePostStatus.OPEN " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     (p.areaName IS NOT NULL AND LOWER(p.areaName) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                     "     (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
                     "AND (:district IS NULL OR :district = '' OR (p.district IS NOT NULL AND LOWER(p.district) LIKE LOWER(CONCAT('%', :district, '%')))) " +
                     "AND (:postType IS NULL OR p.postType = :postType) " +
                     "AND (:minPrice IS NULL OR p.sharePrice >= :minPrice) " +
                     "AND (:maxPrice IS NULL OR p.sharePrice <= :maxPrice) " +
                     "ORDER BY p.createdAt DESC",
              countQuery = "SELECT COUNT(p) FROM RoommatePost p WHERE p.status = com.doan.core.business.enums.RoommatePostStatus.OPEN " +
                     "AND (:keyword IS NULL OR :keyword = '' OR " +
                     "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "     (p.areaName IS NOT NULL AND LOWER(p.areaName) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                     "     (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
                     "AND (:district IS NULL OR :district = '' OR (p.district IS NOT NULL AND LOWER(p.district) LIKE LOWER(CONCAT('%', :district, '%')))) " +
                     "AND (:postType IS NULL OR p.postType = :postType) " +
                     "AND (:minPrice IS NULL OR p.sharePrice >= :minPrice) " +
                     "AND (:maxPrice IS NULL OR p.sharePrice <= :maxPrice)")
       Page<RoommatePost> searchPosts(
                     @Param("keyword") String keyword,
                     @Param("district") String district,
                     @Param("postType") RoommatePostType postType,
                     @Param("minPrice") BigDecimal minPrice,
                     @Param("maxPrice") BigDecimal maxPrice,
                     Pageable pageable);
}
