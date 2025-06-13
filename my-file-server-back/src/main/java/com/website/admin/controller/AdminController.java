package com.website.admin.controller;

import com.website.admin.entity.AdminUserEntity;
import com.website.admin.service.AdminService;
import com.website.security.dto.CustomUserDetails;
import com.website.security.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Stack;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/disable-user")
    public ResponseEntity<List<AdminUserEntity>> getDisableUser(){
        List<AdminUserEntity> adminUserEntities = adminService.getDisableUser();
        return ResponseEntity.ok().body(adminUserEntities);
    }
    @PostMapping("/user-enable/{userCode}")
    public ResponseEntity<String> enableUser(@PathVariable Long userCode){
        adminService.enableUser(userCode);
        return ResponseEntity.ok().body("활성화 성공");
    }
    @PostMapping("/user-status-toggle/{userCode}")
    public ResponseEntity<String> toggleUser(@PathVariable Long userCode){
        adminService.toggleUser(userCode);
        return ResponseEntity.ok().body("변환 성공");
    }


    @GetMapping("/user")
    public ResponseEntity<Page<AdminUserEntity>> getAllUser(@AuthenticationPrincipal CustomUserDetails user,@RequestParam int page){
        if(isAdmin(user.getAuthorities())){
            return ResponseEntity.ok().body(adminService.getUserByPage(page));
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    @GetMapping("/user-find")
    public ResponseEntity<List<AdminUserEntity>> findUser(@AuthenticationPrincipal CustomUserDetails user, @RequestParam String id){
        if(isAdmin(user.getAuthorities())){
            System.out.println(id);
            return ResponseEntity.ok().body(adminService.findUser(id));
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    @PostMapping("/user-disable/{userCode}")
    public ResponseEntity<String> disableUser(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long userCode){
        if(isAdmin(user.getAuthorities())){
            if(adminService.disableUser(userCode)){
                return ResponseEntity.ok().body("비활성화 완료");
            } else {
                return ResponseEntity.ok().body("비활성화 실패");
            }
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    public ResponseEntity<String> deleteUser(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long userCode){
        if(isAdmin(user.getAuthorities())){
            if(adminService.deleteUser(userCode)){
                return ResponseEntity.ok().body("완전 삭제 완료");
            } else {
                return ResponseEntity.ok().body("완전 삭제 실패");
            }
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }


    private boolean isAdmin(Collection<? extends GrantedAuthority> authorities){
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
