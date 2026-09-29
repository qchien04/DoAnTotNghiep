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
@Table(name = "roommate_post_lifestyle_answers")
@IdClass(RoommatePostLifestyleAnswer.RoommatePostLifestyleAnswerId.class)
public class RoommatePostLifestyleAnswer {

    @Id
    @Column(name = "post_id")
    private Long postId;

    @Id
    @Column(name = "question_id")
    private Long questionId;

    @Id
    @Column(name = "option_id")
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", insertable = false, updatable = false)
    private RoommatePost post;

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
    public static class RoommatePostLifestyleAnswerId implements Serializable {
        private Long postId;
        private Long questionId;
        private Long optionId;
    }
}
