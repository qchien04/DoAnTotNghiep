package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_lifestyle_answers")
@IdClass(UserLifestyleAnswer.UserLifestyleAnswerId.class)
public class UserLifestyleAnswer {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "question_id")
    private Long questionId;

    @Id
    @Column(name = "option_id")
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private LifestyleQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", insertable = false, updatable = false)
    private LifestyleOption option;

    @Column(name = "answered_at")
    @Builder.Default
    private LocalDateTime answeredAt = LocalDateTime.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLifestyleAnswerId implements Serializable {
        private Long userId;
        private Long questionId;
        private Long optionId;
    }
}
