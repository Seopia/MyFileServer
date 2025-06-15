package com.website.mainpage.controller;
import com.website.mainpage.dto.*;
import com.website.mainpage.entity.FileEntity;
import com.website.mainpage.entity.FolderEntity;
import com.website.mainpage.service.MainPageService;
import com.website.security.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.OutputStream;
import java.util.Objects;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@RestController
@RequestMapping("/main")
public class MainPageController {
    @Value("${file.upload-dir}")
    private String uploadDir;
    private final MainPageService mainService;

    public MainPageController(MainPageService mainService) {
        this.mainService = mainService;
    }

    @GetMapping("/file/public")
    public ResponseEntity<Page<FileEntity>> getPublicFile(@RequestParam int page){
        Page<FileEntity> fileEntities = mainService.getPublicFiles(page);
        return ResponseEntity.ok().body(fileEntities);
    }
    @GetMapping("/file")
    public ResponseEntity<Page<FileEntity>> getMyFile(@AuthenticationPrincipal CustomUserDetails user,@RequestParam int page) {
        Page<FileEntity> fileEntities = mainService.getMyFile(user,page);
        return ResponseEntity.ok().body(fileEntities);
    }
    @GetMapping("/user")
    public ResponseEntity<UserDto> getUser(@AuthenticationPrincipal CustomUserDetails user){
        return ResponseEntity.ok().body(mainService.getUser(user));
    }
    @GetMapping("/other-user/{userCode}")
    public ResponseEntity<?> getUser(@PathVariable Long userCode){
        try{
            UserPageDTO user = mainService.getOtherUser(userCode);
            return ResponseEntity.ok().body(Objects.requireNonNullElse(user, "유저가 없습니다."));
        }
        catch (Exception e){return ResponseEntity.badRequest().body("유저가 없습니다.");}
    }
    @PostMapping("/user")
    public ResponseEntity<?> modifyUser(UserPageDTO user){
        System.out.println(user.getUserId());
        System.out.println(user.getIntroduce());
        try{
            mainService.modifyUser(user);
            return ResponseEntity.ok().build();
        } catch (Exception e){
            return ResponseEntity.badRequest().build();
        }
    }
    @PostMapping("/download-count/{fileCode}")
    public void increaseCount(@PathVariable Long fileCode){
        mainService.increaseDownloadCount(fileCode);
    }
    @DeleteMapping("/file/{fileCode}")
    public ResponseEntity<String> deleteFile(@PathVariable Long fileCode){
        ResponseEntity.BodyBuilder res = ResponseEntity.ok();
        return switch (mainService.deleteFile(fileCode)) {
            case 200 -> res.build();
            case 400 -> res.body("파일 데이터가 존재하지 않습니다.");
            case 404 -> res.body("파일 데이터는 삭제했지만, 실제 파일을 찾을 수 없었습니다.");
            default -> ResponseEntity.badRequest().build();
        };
    }
    @GetMapping("/root-folder")
    public ResponseEntity<Long> getUserRootFolder(@AuthenticationPrincipal CustomUserDetails user){
        return ResponseEntity.ok().body(mainService.getUserRootFolder(user.getUserCode()));
    }
    @GetMapping("/folder")
    public ResponseEntity<UserFolderDTO> getFileInFolder(@RequestParam Long folderCode, @AuthenticationPrincipal CustomUserDetails user){
        try{
            return ResponseEntity.ok().body(mainService.getDataInFolder(folderCode, user.getUserCode()));
        } catch (Exception e){
            //에러 내용 상세 응답이기 때문에 나중에 수정할 것!!
            return ResponseEntity.badRequest().body(new UserFolderDTO(e.getMessage()));
        }
    }
    @GetMapping("/open/file")
    public ResponseEntity<?> getFile(@RequestParam String uuid){
        System.out.println(uuid);
        try {
            return ResponseEntity.ok().body(mainService.getFile(uuid));
        } catch (FileNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/folder")
    public ResponseEntity<FolderEntity> createFolder(@RequestParam("folderName") String folderName,@RequestParam("folderCode") Long folderCode, @AuthenticationPrincipal CustomUserDetails user){
        return ResponseEntity.ok().body(mainService.createFolder(user.getUserCode(),folderName, folderCode));
    }
    @DeleteMapping("/folder")
    public ResponseEntity<?> deleteFolder(@RequestParam Long folderCode, @AuthenticationPrincipal CustomUserDetails user){
        if(user!=null){
            return ResponseEntity.ok().body(mainService.deleteFolder(folderCode, user.getUserCode()));
        }else{
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    @PostMapping("/upload")
    public ResponseEntity<UserUploadFileDTO> uploadFile(@AuthenticationPrincipal CustomUserDetails user,
                                                        @RequestParam("file") MultipartFile file,
                                                        String description,
                                                        Long folderCode)
    {
        return ResponseEntity.ok().body(mainService.uploadPrivateFile(file, description, user, folderCode));
    }
    @PostMapping("/upload/public")
    public ResponseEntity<UserUploadFileDTO> uploadPublicFile(@AuthenticationPrincipal CustomUserDetails user, @RequestParam("file") MultipartFile file, String description){
        mainService.uploadPublicFile(file,description,user);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/chunk")
    public ResponseEntity<?> uploadChunk(
            @RequestParam("chunk") MultipartFile chunk,
            @RequestParam("chunkIndex") int chunkIndex,
            @RequestParam("totalChunks") int totalChunks,
            @RequestParam("originalFileName") String originalFileName,
            @RequestParam("description") String description,
            @RequestParam("fileSize") long fileSize,
            @RequestParam("folderCode") Long folderCode,
            @AuthenticationPrincipal CustomUserDetails user) {

        try {
            String tempFileDir = uploadDir + "/" + user.getUserCode() + "/";
            Files.createDirectories(Paths.get(tempFileDir));

            // 청크 저장
            Path chunkPath = Paths.get(tempFileDir, "chunk-" + chunkIndex);
            Files.write(chunkPath, chunk.getBytes(), StandardOpenOption.CREATE);

            // 모든 청크 업로드 완료 시 병합 실행
            if (chunkIndex == totalChunks - 1) {
                System.out.println("파일정보 생성..");
                String finalFileName = UUID.randomUUID() + "-" + originalFileName;
                String finalFilePath = uploadDir+ "/" + finalFileName;
                System.out.println("청크 병합 중..");
                // 청크 병합
                mergeChunks(totalChunks, tempFileDir, finalFilePath);
                System.out.println("청크 병합 완료");
                System.out.println(finalFilePath+"에 저장했습니다.");
                UserUploadFileDTO r = mainService.uploadChunk(originalFileName, finalFileName, description, fileSize, user,folderCode);

                // 메타데이터 반환
                return ResponseEntity.ok(r);
            }

            return ResponseEntity.ok(new UserUploadFileDTO("Chunk " + chunkIndex + " uploaded"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Chunk upload failed");
        }
    }
    private void mergeChunks(int totalChunks, String tempFileDir, String finalFilePath) throws IOException {
        try (OutputStream outputStream = new FileOutputStream(finalFilePath)) {
            for (int i = 0; i < totalChunks; i++) {
                Path chunkPath = Paths.get(tempFileDir, "chunk-" + i);
                Files.copy(chunkPath, outputStream);
                Files.delete(chunkPath); // 청크 삭제
                System.out.println("청크 "+i+" 작업 완료, 청크 삭제 완료");
            }
        }
        System.out.println("임시 디렉토리 삭제 = " + tempFileDir);
        Files.delete(Paths.get(tempFileDir)); // 임시 디렉토리 삭제
    }
    @PostMapping("/folder-name")
    public ResponseEntity<?> modifyFolderName(@RequestParam("folderCode") Long folderCode,@RequestParam("description") String description){
        mainService.modifyFolderName(folderCode,description);
        return ResponseEntity.ok().build();
    }
}
