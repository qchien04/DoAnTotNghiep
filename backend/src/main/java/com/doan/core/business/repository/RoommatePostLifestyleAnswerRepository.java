package com.doan.core.business.repository;

import com.doan.core.business.entity.RoommatePostLifestyleAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoommatePostLifestyleAnswerRepository extends JpaRepository<RoommatePostLifestyleAnswer, RoommatePostLifestyleAnswer.RoommatePostLifestyleAnswerId> {

    @Query("SELECT a FROM RoommatePostLifestyleAnswer a JOIN FETCH a.question JOIN FETCH a.option WHERE a.postId = :postId ORDER BY a.question.sortOrder ASC")
    List<RoommatePostLifestyleAnswer> findByPostIdWithDetails(Long postId);

    List<RoommatePostLifestyleAnswer> findByPostId(Long postId);

    @Modifying
    @Query("DELETE FROM RoommatePostLifestyleAnswer a WHERE a.postId = :postId")
    void deleteByPostId(Long postId);
}
