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
    

<details>
  <summary>초기 버전</summary>

![image](https://github.com/user-attachments/assets/2b515e3c-ad64-4da1-9040-14449326082f)
- 배포!!
- 파일 업로드 현
- 파일 업로드 기능
- 파일 다운로드 기능Add commentMore actions
- 로그인, 로그아웃 기능
</details>
<details>
  <summary>0.1.0</summary>
  
![image](https://github.com/user-attachments/assets/33abaeae-e5b2-4b4f-bc71-d73a5e4ed358)
- 다운로드 카운트 추가 => 실제 정상 작동 가능
- 파일 날짜 기준 정렬 => 최신 순으로 정렬
- 로그인 관련 로직 버그 수정 => 토큰이 만료되면 메세지 출력 무한 반복 버그
- 페이징 처리 => pagination 라이브러리, JPA Page 객체 활용
- 파일 이름 입력 모달 => 파일 업로드 시 모달에 파일 이름을 입력
- 업로드 성공 시 메세지 => 업로드 성공 시 메세지 출력
- 모달 창 UX 향상을 위한 단축키 ESC, Enter 등..
- 파일 업로드 버튼 디자인 개선
- 파일 삭제 가능 => 영구적인 삭제
- 업로드 날짜 디자인 개선
- 모바일 페이지 개선
</details>

<details>
  <summary>0.2.0</summary>
  
- 파일 이름 확장자도 같이 저장 => 파일이름.png
- 삭제 아이콘 휴지통 모양으로 변경
- 파일 용량 표시
- 모바일 화면 UI 개선
</details>

<details>
  <summary>0.3.0</summary>
  
  - 모바일 사진 이름 클릭시 사진 미리보기 가능
- 개인, 공용 자료실 출시
- 모바일 업로드 버튼 css 버그 수정
- 최적화
- https 인증서 발급
</details>

<details>
  <summary>정식 출시 : 1.0</summary>
  
  ![image](https://github.com/user-attachments/assets/7f452218-af7e-4b10-ba84-9590ac92a633)
  - UI 개편
- 모든 기능 모바일 환경 완벽 호환
- 개인 클라우드 대 개편
- 개인 클라우드에서 폴더를 사용하여 파일 관리 로직 출시
- 관리자 페이지 출시
- 자유 게시판 출시
- 그룹(팀) 클라우드 체험 버전 출시
- 다른 유저 마이페이지 활동 관찰 기능 출시
- 회원 가입 요청 추가
- 회원 가입 아이디, 비밀번호 검사 로직 추가
</details>

<details>
  <summary>1.1.0</summary>
  
  - 사이트 소개 페이지 생성
- 개인 클라우드 대용량 파일 UI, 기능 업데이트
- 마이페이지 자기소개 추가
- 파일 업로드 진행 % 추가
</details>

<details>
  <summary>2.0 UI 업데이트</summary>
  
  상세 설명은 커밋 메세지 참고
  ![image](https://github.com/user-attachments/assets/053994c4-dcea-4695-bcd3-526445c71ef3)
![image](https://github.com/user-attachments/assets/05bf3ff4-ec84-4dc4-8532-7663fc7a9b78)
![image](https://github.com/user-attachments/assets/7616b71b-adec-4c86-bbae-4b950cf977ed)
![image](https://github.com/user-attachments/assets/64453bb2-63b4-4a2c-9732-e0eb7cad9d17)
![image](https://github.com/user-attachments/assets/2ffe4c01-a0e1-4ce0-9554-9a35b92f2ee4)
</details>



