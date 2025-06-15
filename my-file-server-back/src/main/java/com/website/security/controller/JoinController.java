package com.website.security.controller;

import com.website.common.Tool;
import com.website.security.dto.JoinDTO;
import com.website.security.entity.User;
import com.website.security.service.JoinService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@ResponseBody
public class JoinController {

    private final JoinService joinService;
    private final Tool tool;
    public JoinController(JoinService joinService, Tool tool) {
        this.joinService = joinService;
        this.tool = tool;
    }

    @PostMapping("/join")
    public ResponseEntity<String> joinUser(JoinDTO joinDTO){
        try {
                joinService.joinUser(joinDTO);
                tool.sendEmail("회원가입을 신청했습니다.","검토하고 승인하세요.", "아이디 : "+ joinDTO.getId()+"<br/> 비밀번호 : "+joinDTO.getPassword()+"<br/> 닉네임 : "+joinDTO.getNickname());
                return ResponseEntity.ok().body("회원가입 승인을 기다려주세요.");
        } catch (Exception e){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("회원가입에 실패했습니다. : "+e.getMessage());
        }
    }
    @GetMapping("/join/valid")
    public ResponseEntity<Boolean> checkId(@RequestParam String value, @RequestParam String field){
        if(field.equals("username")){
            return ResponseEntity.ok().body(joinService.checkId(value));
        } else if(field.equals("nickname")){
            return ResponseEntity.ok().body(joinService.checkNickname(value));
        }
        return null;
    }

//    private boolean validateId(String id){
//        boolean hasString = id.matches(".*[a-zA-Z].*");
//        boolean hasNumber = id.matches(".*\\d.*");
//        return hasString && hasNumber && id.length() >= 8;
//    }
//    private boolean validatePassword(String password) {
//        boolean baseCheck = validateId(password);
//        boolean hasSpecial = password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
//        return baseCheck && hasSpecial;
//    }
}
