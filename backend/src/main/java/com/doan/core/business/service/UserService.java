package com.doan.core.business.service;

import com.doan.core.business.dto.response.UserDto;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.data.PagingRequest;

public interface UserService {

    PageResponse<UserDto> getUsers(PagingRequest pagingRequest);

    UserDto getUserById(Long id);

    long countUsers();
}
