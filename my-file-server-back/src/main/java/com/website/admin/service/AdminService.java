package com.website.admin.service;

import com.website.admin.entity.AdminUserEntity;
import com.website.admin.repository.AdminUserRepository;
import com.website.security.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    private final AdminUserRepository adminUserRepository;
    public AdminService(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    public List<AdminUserEntity> getDisableUser() {
        return adminUserRepository.getDisableUser();
    }

    public void enableUser(Long userCode) {
        AdminUserEntity user = adminUserRepository.findById(userCode).orElseThrow();
        user.setEnable(true);
        adminUserRepository.save(user);
    }

    public Page<AdminUserEntity> getUserByPage(int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("enable"));
        return adminUserRepository.findAll(pageable);
    }

    public List<AdminUserEntity> findUser(String id) {
        return adminUserRepository.findAllByUserId("%"+id+"%");
    }
    @Transactional
    public boolean disableUser(Long userCode) {
        try {
            AdminUserEntity user = adminUserRepository.findById(userCode).orElseThrow();
            user.setEnable(false);
            adminUserRepository.save(user);
            return true;
        }catch (Exception e){
            return false;
        }
    }

    public boolean deleteUser(Long userCode) {
        try {
            adminUserRepository.deleteById(userCode);
            return true;
        }catch (Exception e){
            return false;
        }
    }
    @Transactional
    public void toggleUser(Long userCode) {
        AdminUserEntity user = adminUserRepository.findById(userCode).orElseThrow();
        user.setEnable(!user.isEnable());
        adminUserRepository.save(user);
    }

}
