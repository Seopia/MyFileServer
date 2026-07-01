package com.website.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Getter@Setter
public class AdminUserDto {
    private Long userCode;
    private String id;
    private String userRole;
    private boolean isEnable;
    private String nickname;
    private LocalDateTime lastLoginTime;
    private String profileImage;
}
