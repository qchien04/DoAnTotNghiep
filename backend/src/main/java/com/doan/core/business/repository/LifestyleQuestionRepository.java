package com.doan.core.business.repository;

import com.doan.core.business.entity.LifestyleQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LifestyleQuestionRepository extends JpaRepository<LifestyleQuestion, Long> {

    @Query("SELECT q FROM LifestyleQuestion q LEFT JOIN FETCH q.options WHERE q.isActive = true ORDER BY q.sortOrder ASC")
    List<LifestyleQuestion> findAllActiveWithOptions();

    List<LifestyleQuestion> findByIsActiveTrueOrderBySortOrderAsc();
}
