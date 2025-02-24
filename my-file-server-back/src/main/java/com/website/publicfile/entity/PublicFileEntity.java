package com.website.publicfile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Stack;

@Entity
@Table(name = "public_file")
@AllArgsConstructor@NoArgsConstructor
@Getter@Setter
public class PublicFileEntity {
    @Id
    @Column(name = "public_file_code")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileCode;
    @Column(name = "changed_name")
    private String changedName;
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    @Column(name = "download_count")
    private int downloadCount;
    @Column(name = "original_name")
    private String originalName;
    @Column(name = "size")
    private long size;
    @Column(name = "title")
    private String title;
    @Column(name = "file_full_path")
    private String fileFullPath;

    public PublicFileEntity(String changedName, LocalDateTime uploadedAt, int downloadCount, String originalName, long size, String title, String fileFullPath, String category, String description, PublicFileUserEntity user) {
        this.changedName = changedName;
        this.uploadedAt = uploadedAt;
        this.downloadCount = downloadCount;
        this.originalName = originalName;
        this.size = size;
        this.title = title;
        this.fileFullPath = fileFullPath;
        this.category = category;
        this.description = description;
        this.user = user;
    }

    @Column(name = "category")
    private String category;
    @Column(name = "description")
    private String description;
    @OneToOne
    @JoinColumn(name = "uploaded_by")
    private PublicFileUserEntity user;
}
