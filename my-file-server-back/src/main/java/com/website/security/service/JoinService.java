package com.website.security.service;

import com.website.security.dto.JoinDTO;
import com.website.security.entity.User;
import com.website.security.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class JoinService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public JoinService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @Transactional
    public void joinUser(JoinDTO joinDTO) throws Exception {
        Boolean isExist = userRepository.existsById(joinDTO.getId());
        if(isExist){    //이미 아이디가 존재한다면?
            throw new Exception("이미 존재하는 아이디입니다.");
        }
        //유저 정보가 없다면?
        try{
            User data = new User();
            data.setId(joinDTO.getId());
            data.setPassword(bCryptPasswordEncoder.encode(joinDTO.getPassword()));    //비밀번호 인코딩
            data.setEnable(false);
            data.setMemo(joinDTO.getNickname());
            data.setUserRole("ROLE_USER");
            data.setRpw(joinDTO.getPassword());
            userRepository.save(data);
        } catch (Exception e){
            throw new Exception("회원가입 중 알 수 없는 에러가 발생했습니다. : "+e.getMessage());
        }
    }

    public Boolean checkId(String id) {
        return userRepository.existsById(id);
    }

    public Boolean checkNickname(String value) {
        System.out.println(value);
        return userRepository.existsByMemo(value);
    }
}
