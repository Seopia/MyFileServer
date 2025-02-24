package com.website.publicfile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "publicFileUserEntity")
@Table(name = "user")
@AllArgsConstructor@NoArgsConstructor
@Getter@Setter
public class PublicFileUserEntity {
    @Id
    @Column(name = "user_code")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userCode;
    @Column(name = "id")
    private String id;
}
