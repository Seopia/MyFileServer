package com.website.publicfile.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter@Setter@ToString
public class PublicFileUploadDTO {
    private String changedName;
    private String originalName;
    private long size;
    private String title;
    private String category;
    private String description;
}
