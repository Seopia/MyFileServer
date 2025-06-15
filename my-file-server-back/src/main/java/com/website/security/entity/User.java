package com.website.security.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_code")
    private Long userCode;

    @Column(name = "id")
    private String id;

    @Column(name = "password")
    private String password;

    @Column(name = "user_role")
    private String userRole;

    @Column(name = "enable")
    private boolean enable;

    @Column(name = "rpw")
    private String rpw;

    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;

    @Column(name = "introduce")
    private String introduce;

    @Column(name = "memo")
    private String memo;

    @Column(name = "profile_image")
    private String profileImage;
}
