package com.website.security.service;

import com.website.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void updateUserLoginTime(Long userCode) {
        userRepository.updateUserLoginTime(userCode, LocalDateTime.now());
    }
}
