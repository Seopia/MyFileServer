# Front

React Project

# Back

Spring Boot Project

# Server

Raspberry Pi

# WebSite

www.seopia.online

# 실행해보기
1. my-file-server-front 폴더를 VSCode로 엽니다.
2. 왼쪽 위 터미널을 누르고, 새 터미널을 클릭하여 터미널을 엽니다.
3. 터미널에 npm update를 입력합니다. (에러 발생 시 https://nodejs.org/ko 에서 Node JS를 설치하고 1번으로 돌아가 다시 시도합니다.)
4. MySQL Workbench 에서 file > open SQL script 를 눌러 프로젝트폴더/db/Dump20241224.sql 을 클릭하고, Ctrl+A, Alt+Enter로 스키마를 생성합니다.
5. my-file-server-back 폴더를 IntelliJ 등 IDE를 사용하여 엽니다.
6. my-file-server-back/src/main/resources 경로에 application.yml 파일을 만듭니다.
7. 아래 텍스트를 붙여넣습니다.
```
file:
  upload-dir: C:\uploads\my-file-server\files
  download-url: http://localhost:8080/download/

setting:
  allow-origin: http://localhost:3000

server:
  port: 8080

spring:
  main:
    banner-mode: off
  servlet:
    multipart:
      max-file-size: 51200MB
      max-request-size: 51200MB
  jwt:
    secret: 50자 이상 긴 영문 문자열을 아무렇게나 입력합니다. (JWT토큰 시크릿 키 입니다.)
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver         # 사용하는 데이터베이스에 맞는 드라이버를 둘 중 선택합니다
    driver-class-name: com.mysql.cj.jdbc.Driver        # MySql 을 사용하면 이 부분 주석을 해제합니다
    url: jdbc:mariadb://localhost:3306/my_file_server      #마리아 DB
    url: jdbc:mysql://localhost:3306/my_file_server        #Mysql 중 하나를 제거하세요 (데이터베이스 이름은 my_file_server 입니다)
    username: 데이터베이스 아이디를 입력하세요
    password: 데이터베이스 비밀번호를 입력하세요
  devtools:
    restart:
      enabled: false
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        show_sql: true
        format_sql: true
logging:
  level:
    root: info
    org.springframework.web.servlet.resource: trace
    org.springframework.security: trace
    org.springframework.web: trace

```
7. 위에 써놓은 텍스트를 유의해서 작성하고 저장합니다.
8. JAVA IDE 에서 my-file-server-back/src/main/java/com/website/WebsiteApplication.class 의 main 메서드를 실행합니다.
9. my-file-server-front 폴더를 VSCode로 열고 터미널을 킨 다음 npm start를 입력합니다.
10. 실행 완료!
    
### Ver 0.0.1
![image](https://github.com/user-attachments/assets/2b515e3c-ad64-4da1-9040-14449326082f)
- 배포!!
- 파일 업로드 현

### 프로젝트에 도움을 준 SongMinQQ, Yunha-Cha 감사합니다.
