package com.doan.core.business.repository;

import com.doan.core.business.entity.RoommateApplicationLifestyleAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoommateApplicationLifestyleAnswerRepository extends JpaRepository<RoommateApplicationLifestyleAnswer, RoommateApplicationLifestyleAnswer.RoommateApplicationLifestyleAnswerId> {

    @Query("SELECT a FROM RoommateApplicationLifestyleAnswer a JOIN FETCH a.question JOIN FETCH a.option WHERE a.applicationId = :applicationId ORDER BY a.question.sortOrder ASC")
    List<RoommateApplicationLifestyleAnswer> findByApplicationIdWithDetails(Long applicationId);

    List<RoommateApplicationLifestyleAnswer> findByApplicationId(Long applicationId);

    @Modifying
    @Query("DELETE FROM RoommateApplicationLifestyleAnswer a WHERE a.applicationId = :applicationId")
    void deleteByApplicationId(Long applicationId);
}
