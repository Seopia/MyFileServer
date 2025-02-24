package com.website.publicfile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "public_file_recommend")
@AllArgsConstructor@NoArgsConstructor
@Getter@Setter
public class PublicFileRecommendEntity {
    @Id
    @Column(name = "public_file_recommend_code")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long publicFileRecommendCode;
    @OneToOne
    @JoinColumn(name = "user_code")
    private PublicFileUserEntity user;
    @Column(name = "public_file_code")
    private Long publicFileCode;
    @Column(name = "recommend_date")
    private LocalDateTime recommendDate;

    public PublicFileRecommendEntity(PublicFileUserEntity user, Long publicFileCode, LocalDateTime recommendDate) {
        this.user = user;
        this.publicFileCode = publicFileCode;
        this.recommendDate = recommendDate;
    }
}
