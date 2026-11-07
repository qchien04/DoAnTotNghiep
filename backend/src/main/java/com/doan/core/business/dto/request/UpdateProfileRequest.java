package com.doan.core.business.dto.request;

import lombok.*;
import java.time.LocalDate;

import com.doan.core.business.enums.Gender;
import com.doan.core.business.enums.GenderPreference;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private Gender gender;
    private GenderPreference genderPreference;
    private Boolean smokes;
    private Boolean rejectsSmokers;
    private Boolean hasPet;
    private Boolean rejectsPets;
    private String bio;
    private String avatarUrl;
}
