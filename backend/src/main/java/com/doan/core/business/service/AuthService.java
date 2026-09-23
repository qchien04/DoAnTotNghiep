package com.doan.core.business.service;

import com.doan.core.business.dto.request.LoginRequest;
import com.doan.core.business.dto.request.RefreshTokenRequest;
import com.doan.core.business.dto.request.RegisterRequest;
import com.doan.core.business.dto.response.AuthResponse;
import com.doan.core.business.dto.response.UserDto;
import com.doan.core.common.security.UserPrincipal;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserDto register(RegisterRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);

    UserDto getMe(UserPrincipal userPrincipal);
}
