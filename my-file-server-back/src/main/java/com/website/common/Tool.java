package com.website.common;

import com.website.mainpage.dto.UserUploadFileDTO;
import com.website.mainpage.entity.FileEntity;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class Tool {
    @Value("${file.upload-dir}")
    private String uploadDir;
    @Value("${file.upload-public-file-image-url}")
    private String publicFileImageUploadDir;
    private final JavaMailSender mailSender;

    public Tool(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * 파일을 업로드하는 메서드 파일은 C:\project-files-bu200ServerFile 에 저장된다.
     * 경로가 없다면 생성한다. 에러가 나면 메세지 출력 후 null 을 응답한다. 윈도우에서만 사용 가능.
     * 파일을 확인하고 싶다면 --"http://localhost:8080/uploads/변경된파일명"-- 입력 시 확인 가능
     * @param file 파일 하나를 받음
     * @return UUID로 변경된 파일 이름
     */
    public String upload(MultipartFile file) {
        if(file.getOriginalFilename() != null) {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());            //파일 이름
            String changedFileName = UUID.randomUUID() + "-" + originalFileName;                    //변경된 파일 이름은 랜덤 UUID_원본파일명 형식으로 저장된다.
            System.out.println(changedFileName);
            try{
                String filePath = uploadDir + File.separator + changedFileName;
                save(file, filePath);
                return changedFileName;
            } catch (IOException e) {   //파일 저장 중 에러 발생 상황
                System.err.println(e.getMessage());
                return null;
            }
        }
        return null;
    }
    public String upload(MultipartFile file, String status){
        if(file.getOriginalFilename() != null) {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());            //파일 이름
            String changedFileName = UUID.randomUUID() + "-" + originalFileName;                    //변경된 파일 이름은 랜덤 UUID_원본파일명 형식으로 저장된다.
            System.out.println(changedFileName);
            try{
                String filePath = null;
                if(status.equals("public")){
                    filePath = publicFileImageUploadDir + File.separator + changedFileName;
                }
                save(file,filePath);
                return changedFileName;

            } catch (IOException e) {
                System.err.println(e.getMessage());
                return null;
            }
        }
        return null;
    }
    private void save(MultipartFile file,String filePath) throws IOException {
        File dest = new File(filePath);
        File directory = new File(dest.getParent());
        if(!directory.exists()){
            if(directory.mkdirs()){
                System.out.println("경로가 존재하지 않아 생성하였습니다.");
            } else {
                throw new IOException("경로가 존재하지 않아 생성하려고 했으나 실패했습니다. : " + directory.getAbsolutePath());
            }
        }
        file.transferTo(dest);
    }

    /**
     * 파일을 삭제하는 메서드.
     * @param fileName 삭제할 파일 이름
     * @return 파일 삭제 성공 여부
     */
    public boolean deleteFile(String fileName) {
        if (fileName != null && !fileName.isEmpty()) {
            String filePath = uploadDir + File.separator + fileName;
            File file = new File(filePath);

            if (file.exists()) {
                if (file.delete()) {
                    System.out.println("파일이 성공적으로 삭제되었습니다: " + filePath);
                    return true;
                } else {
                    System.err.println("파일 삭제에 실패했습니다: " + filePath);
                }
            } else {
                System.err.println("파일이 존재하지 않습니다: " + filePath);
            }
        } else {
            System.err.println("유효하지 않은 파일 이름입니다.");
        }
        return false;
    }
    public String getFileExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == originalFilename.length() - 1) {
            return "";
        }
        return originalFilename.substring(dotIndex + 1);
    }
    public String getFileEx(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "";
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1);
    }
    public UserUploadFileDTO convertFileEntity(FileEntity savedEntity){
        return new UserUploadFileDTO(
                savedEntity.getFileCode(),
                savedEntity.getChangedName(),
                savedEntity.getUploadedAt(),
                savedEntity.getDescription(),
                savedEntity.getFileFullPath(),
                savedEntity.getDownload_count(),
                savedEntity.getOriginalName(),
                savedEntity.getSize(),
                savedEntity.isPrivate(),
                savedEntity.getFolder().getFolderCode(),
                "업로드 성공!"
        );
    }
    public boolean sendEmail(String subject, String title, String content){
        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(new InternetAddress("wjdwltjq7289@naver.com", "Seopia Cloud", "UTF-8"));
            helper.setTo("wjdwltjq7289@gmail.com");
            helper.setSubject(subject);
            String html = """
            <!DOCTYPE html>
            <html lang="ko">
            <head>
              <meta charset="UTF-8">
              <title>Email</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1 style="color: #333;">%s</h1>
              <p style="font-size: 16px; color: #555;">%s</p>
            </body>
            </html>
            """.formatted(title, content);

            helper.setText(html, true);
            mailSender.send(message);
            return true;
        } catch (Exception e){
            System.out.println(e.getMessage());
            return false;
        }
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
