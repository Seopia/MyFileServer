package com.website.mainpage.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "MainUserEntity")
@Table(name = "user")
@AllArgsConstructor
@NoArgsConstructor
@Setter@Getter
public class MainUserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_code")
    private Long userCode;
    @Column(name = "id")
    private String id;
    @Column(name = "user_role")
    private String userRole;
    @Column(name = "introduce")
    private String introduce;
}
