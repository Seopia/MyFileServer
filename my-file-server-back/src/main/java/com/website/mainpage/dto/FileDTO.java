package com.website.mainpage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FileDTO {
    private Long fileCode;
    private LocalDateTime uploadedAt;
    private String fileName;
    private String fileFullPath;
    private String memo;
    private int downloadCount;
    private long size;
}
