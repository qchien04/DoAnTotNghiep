package com.doan.core.business.service.impl;

import com.doan.core.business.dto.response.UserDto;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.UserService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.data.PagingRequest;
import com.doan.core.common.exception.BaseException;
import com.doan.core.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserDto> getUsers(PagingRequest pagingRequest) {
        Page<User> userPage = userRepository.findAll(pagingRequest.toPageable());
        Page<UserDto> dtoPage = userPage.map(UserDto::fromEntity);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }
}
