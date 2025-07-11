package com.website.mainpage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter@Setter
public class UserPageDTO {
    private Long userCode;
    private String userId;
    private String profileImage;
    private String introduce;

    private Long uploadPublicFileCount;
    private Long writtenCommentCount;
    private Long uploadFileCount;
}
