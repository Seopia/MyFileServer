package com.website.security.jwt;

import com.website.security.dto.CustomUserDetails;
import com.website.security.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class JWTFilter extends OncePerRequestFilter {

    @Value("${file.upload-dir}")
    private String uploadDir;
    private final JWTUtil jwtUtil;

    public JWTFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     *
     * needAuthUrl 배열에 검사가 필요한 URL 작성
     * 일치하면 JWT 토큰 검사 후 CustomUserDetails 생성
     *
     * @param path 요청 경로
     * @return bool
     */
    private boolean checkUrl(String path){

        String[] needAuthUrl = {"/login","/download","/join","/public/open","/main/open"};

        for (String s : needAuthUrl) {
            if (path.startsWith(s)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if(!checkUrl(path)){
            String authorization = request.getHeader("Authorization");
            if(authorization == null || !authorization.startsWith("Bearer ")){
//                System.out.println("token이 없거나, Bearer가 포함되어 있지 않습니다.");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED,"토큰이 없거나, Bearer가 포함되어 있지 않습니다.");
                return;
            }
            String token = authorization.split(" ")[1];
            if(jwtUtil.isExpired(token)){
//                System.out.println("token Expire 상태입니다.");
                response.sendError(HttpServletResponse.SC_FORBIDDEN,"로그인이 만료되었습니다.");
                return;
            }

            Long accountCode = jwtUtil.getUserCode(token);
            String accountId = jwtUtil.getUserId(token);
            String accountRole = jwtUtil.getUserRole(token);


            User user = new User();
            user.setId(accountId);
            user.setUserRole(accountRole);
            user.setUserCode(accountCode);
            CustomUserDetails customUserDetails = new CustomUserDetails(user);

            Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authToken);

            filterChain.doFilter(request,response);
        } else {
            //검사 필요한거 아니면 넘어감 단, 유저가 누군지 모름! Context Holder 사용 불가
            filterChain.doFilter(request,response);
        }
    }
}
