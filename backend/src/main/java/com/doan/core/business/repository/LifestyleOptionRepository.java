package com.doan.core.business.repository;

import com.doan.core.business.entity.LifestyleOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LifestyleOptionRepository extends JpaRepository<LifestyleOption, Long> {

    List<LifestyleOption> findByQuestionIdAndIsActiveTrueOrderBySortOrderAsc(Long questionId);
}
