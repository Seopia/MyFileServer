package com.website.publicfile.dto;

import com.website.publicfile.entity.PublicFileUserEntity;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter@Setter@ToString
public class PublicFileDetailDTO {
    private Long fileCode;
    private String changedName;
    private LocalDateTime uploadedAt;
    private int downloadCount;
    private String originalName;
    private long size;
    private String title;
    private String fileFullPath;
    private String category;
    private String description;
    private Long userCode;
    private String id;
    //좋아요 수
    private int recommendCount;
}
