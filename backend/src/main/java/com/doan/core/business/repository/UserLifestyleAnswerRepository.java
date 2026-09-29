package com.doan.core.business.repository;

import com.doan.core.business.entity.UserLifestyleAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLifestyleAnswerRepository extends JpaRepository<UserLifestyleAnswer, UserLifestyleAnswer.UserLifestyleAnswerId> {

    @Query("SELECT a FROM UserLifestyleAnswer a JOIN FETCH a.question JOIN FETCH a.option WHERE a.userId = :userId ORDER BY a.question.sortOrder ASC")
    List<UserLifestyleAnswer> findByUserIdWithDetails(Long userId);

    List<UserLifestyleAnswer> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM UserLifestyleAnswer a WHERE a.userId = :userId")
    void deleteByUserId(Long userId);
}
