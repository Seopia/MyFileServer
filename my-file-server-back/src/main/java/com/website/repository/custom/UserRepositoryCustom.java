package com.website.repository.custom;

import com.website.admin.dto.AdminUserDto;
import com.website.repository.enums.UserSort;
import org.springframework.data.domain.Page;

public interface UserRepositoryCustom {
    Page<AdminUserDto> searchUserForAdmin(String keyword, UserSort sortFiled, int page, boolean asc);
}
