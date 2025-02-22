package com.website.mainpage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter@Setter
public class UserPageDTO {
    private Long userCode;
    private String userId;
    private int writtenPostCount;
    private int writtenCommentCount;
    private int uploadFileCount;
    private String profileImage;
    private String introduce;
}
