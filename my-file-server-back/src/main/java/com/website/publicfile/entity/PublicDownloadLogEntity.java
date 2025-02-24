package com.website.publicfile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table(name = "public_download_log")
@AllArgsConstructor@NoArgsConstructor
@Getter@Setter
public class PublicDownloadLogEntity {
    @Id
    @Column(name = "public_download_log_code")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long publicDownLogCode;
    @OneToOne
    @JoinColumn(name = "user_code")
    private PublicFileUserEntity user;
    @OneToOne
    @JoinColumn(name = "public_file_code")
    private PublicFileEntity file;

    public PublicDownloadLogEntity(PublicFileUserEntity user, PublicFileEntity file) {
        this.user = user;
        this.file = file;
    }
}
