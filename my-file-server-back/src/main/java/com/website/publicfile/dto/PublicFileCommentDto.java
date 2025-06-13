package com.website.publicfile.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Getter@Setter
public class PublicFileCommentDto {
    private String content;
    private LocalDateTime createAt;
    private Long publicFileCommentCode;
    private String id;
    private Long userCode;
}
