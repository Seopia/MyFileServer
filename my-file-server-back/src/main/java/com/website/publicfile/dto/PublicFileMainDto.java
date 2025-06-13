package com.website.publicfile.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter@Setter
public class PublicFileMainDto {
    private Long fileCode;
    private LocalDateTime uploadedAt;
    private int downloadCount;
    private String category;
    private String title;
    private String id;
    private Long userCode;
    private Long fileSize;
}
