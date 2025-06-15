package com.website.mainpage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter@Setter
public class UserDto {
    private Long userCode;
    private String id;
    private String userRole;
    private String introduce;
}
