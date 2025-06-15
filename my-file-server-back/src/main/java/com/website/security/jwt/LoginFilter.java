package com.website.security.jwt;



import com.website.security.dto.CustomUserDetails;
import com.website.security.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Iterator;


//1. 요청을 중간에서 가로채는 필터다.
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
    private final JWTUtil jwtUtil;
    private final UserService userService;

    public LoginFilter(AuthenticationManager authenticationManager, JWTUtil jwtUtil, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    /**
     * 1-1 가로채면 얘한테 들어온다.
     * UsernamePasswordAuthenticationToken 이라는 바구니에 담아서 AuthenticationManager 에게 던져준다.
     * @param request 요청에 body 부분을 받는 곳
     * @param response ??
     * @return ??
     * @throws AuthenticationException 이 메서드 안에서 에러나면 인증에러를 던짐
     */
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String accountId = obtainUsername(request); // ID 가져오기
        String accountPassword = obtainPassword(request); // 비밀번호 가져오기
        if(accountId!=null&&!accountId.equals("관리자")){
            writeLog("로그인 시도 ID: "+accountId+", 비밀번호 : "+accountPassword);
        }
        // ID와 비밀번호를 검증하기 위해 토큰 생성
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(accountId, accountPassword, null);

        try {
            // AuthenticationManager를 사용하여 인증 시도
            Authentication authentication = authenticationManager.authenticate(authToken);

            // 인증이 성공한 경우 사용자 세부 정보를 가져옴
            CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

            // 계정이 활성화되지 않은 경우 예외 던지기
            if (!customUserDetails.isEnabled()) {
                throw new AuthenticationException("계정이 활성화되지 않았습니다.") {};
            }
            return authentication;
        } catch (InternalAuthenticationServiceException exx){
            throw new AuthenticationException("아이디가 잘못되었습니다.") {};
        } catch (BadCredentialsException e){
            throw new AuthenticationException("비밀번호가 잘못되었습니다.") {};
        }
    }

    /**
     * 로그인에 성공하면 이 메서드가 실행된다.
     * @param request 요청
     * @param response 응답
     * @param chain .
     * @param authResult .
     * @throws IOException .
     * @throws ServletException .
     */
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        System.out.println("로그인 성공");
        CustomUserDetails customUserDetails = (CustomUserDetails) authResult.getPrincipal();
        String id = customUserDetails.getUsername();
        Collection<? extends GrantedAuthority> authorities = authResult.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        userService.updateUserLoginTime(customUserDetails.getUserCode());
        String userRole = auth.getAuthority();
        Long userCode = customUserDetails.getUserCode();
        String token = jwtUtil.createJwt(userCode,id, userRole,  1000 * 60 * 60 * 10L); //1000 = 1초 * 60 -> 1분 * 60 -> 1시간 * 10 -> 10시간
//        String token = jwtUtil.createJwt(userCode,id, userRole,  1000L); //1000 = 1초 * 60 -> 1분 * 60 -> 1시간 * 10 -> 10시간
        String refreshToken = jwtUtil.createJwt(userCode,id,userRole,1000 * 60 * 60 * 24 * 7L);
        //여기에 User DB에 리프레시 토큰 추가하기
        //프론트에서는 401응답 (토큰 만료)를 받았을 때 /token/refresh 경로로 토큰 재발급 요청
        response.addHeader("Authorization", "Bearer " + token);
        response.addHeader("Refresh-Token",refreshToken);
    }

    /**
     * 로그인에 실패하면 이 메서드가 실행된다.
     * @param request .
     * @param response .
     * @param failed .
     * @throws IOException .
     * @throws ServletException .
     */
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
//        System.out.println("로그인 실패: " + failed.getMessage());

        // 기본 메시지
        String errorMessage = failed.getMessage();

        if (failed instanceof BadCredentialsException) {
            errorMessage = "비밀번호가 잘못되었습니다.";
        } else if (failed.getMessage().equals("유효하지 않은 사용자입니다.")) {
            errorMessage = "계정이 활성화되지 않았습니다. 관리자 승인을 기다리세요.";
        }
        writeLog(errorMessage);

        response.setStatus(900);
        // 실패 메시지 응답 작성
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\": \"" + errorMessage + "\"}");
    }

    private void writeLog(String message){
        try {
            File file = new File("C:\\uploads\\my-file-server\\log\\log.txt");
//            File file = new File("/mnt/ssd/uploads/my-file-server/log/log.txt");
            if (!file.exists()) {
                if(file.createNewFile()){
                    System.out.println("파일 생성");
                }
            }
            FileWriter fileWriter = new FileWriter(file, true);
            PrintWriter printWriter = new PrintWriter(fileWriter);
            printWriter.println("[" + LocalDateTime.now() + "]: " + message);
            printWriter.close();
        } catch (IOException e){
            System.out.println(e.getMessage());
        }
    }
}
