package com.website.admin.service;

import com.website.admin.dto.AdminUserDto;
import com.website.repository.UserRepository;
import com.website.repository.enums.UserSort;
import com.website.security.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<AdminUserDto> getUsers(String keyword, int page, String sortFiled, Boolean isAsc) {
        return userRepository.searchUserForAdmin(keyword, UserSort.from(sortFiled), page, isAsc);
    }

    @Transactional
    public Boolean toggleUserActivation(Long userCode) {
        try {
            User user = userRepository.findByUserCode(userCode);
            user.setEnable(!user.isEnable());
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
