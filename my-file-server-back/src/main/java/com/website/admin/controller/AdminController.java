package com.website.admin.controller;

import com.website.admin.dto.AdminUserDto;
import com.website.admin.service.AdminService;
import com.website.security.dto.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/user")
    public ResponseEntity<Page<AdminUserDto>> getAllUser(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam String keyword,
            @RequestParam int page,
            @RequestParam String sortField,
            @RequestParam Boolean isAsc
            ){
        if(isAdmin(user.getAuthorities())){
            return ResponseEntity.ok().body(adminService.getUsers(keyword,page,sortField,isAsc));
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    @PatchMapping("/users/{userCode}/activation")
    public ResponseEntity<Boolean> toggleUserActivation(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long userCode){
        if(isAdmin(user.getAuthorities())){
            return ResponseEntity.ok().body(adminService.toggleUserActivation(userCode));
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }


    private boolean isAdmin(Collection<? extends GrantedAuthority> authorities){
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
