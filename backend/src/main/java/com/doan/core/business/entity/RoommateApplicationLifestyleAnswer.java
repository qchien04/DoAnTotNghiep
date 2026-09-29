package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roommate_application_lifestyle_answers")
@IdClass(RoommateApplicationLifestyleAnswer.RoommateApplicationLifestyleAnswerId.class)
public class RoommateApplicationLifestyleAnswer {

    @Id
    @Column(name = "application_id")
    private Long applicationId;

    @Id
    @Column(name = "question_id")
    private Long questionId;

    @Id
    @Column(name = "option_id")
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", insertable = false, updatable = false)
    private RoommateApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private LifestyleQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", insertable = false, updatable = false)
    private LifestyleOption option;

    @Column(name = "from_profile", nullable = false)
    @Builder.Default
    private Boolean fromProfile = true;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoommateApplicationLifestyleAnswerId implements Serializable {
        private Long applicationId;
        private Long questionId;
        private Long optionId;
    }
}
