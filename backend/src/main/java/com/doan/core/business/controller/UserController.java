package com.doan.core.business.controller;

import com.doan.core.business.dto.response.UserDto;
import com.doan.core.business.service.UserService;
import com.doan.core.common.data.PageResponse;
import com.doan.core.common.data.PagingRequest;
import com.doan.core.common.data.ResponseData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "2. Quản lý Người dùng (Users)", description = "Các API quản lý danh sách người dùng hệ thống")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Danh sách người dùng có phân trang", description = "Hỗ trợ phân trang và sắp xếp")
    public ResponseEntity<ResponseData<PageResponse<UserDto>>> getUsers(@ModelAttribute PagingRequest pagingRequest) {
        PageResponse<UserDto> users = userService.getUsers(pagingRequest);
        return ResponseEntity.ok(ResponseData.success(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Xem chi tiết người dùng theo ID")
    public ResponseEntity<ResponseData<UserDto>> getUserById(@PathVariable Long id) {
        UserDto userDto = userService.getUserById(id);
        return ResponseEntity.ok(ResponseData.success(userDto));
    }
}
