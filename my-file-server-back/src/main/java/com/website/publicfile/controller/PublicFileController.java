package com.website.publicfile.controller;

import com.website.common.Tool;
import com.website.publicfile.dto.PublicFileCommentDto;
import com.website.publicfile.dto.PublicFileDetailDTO;
import com.website.publicfile.dto.PublicFileMainDto;
import com.website.publicfile.dto.PublicFileUploadDTO;
import com.website.publicfile.entity.PublicFileCommentEntity;
import com.website.publicfile.entity.PublicFileEntity;
import com.website.publicfile.service.PublicFileService;
import com.website.security.dto.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/public")
public class PublicFileController {
    private final PublicFileService publicFileService;
    @Value("${file.upload-dir}")
    private String uploadDir;
    private final Tool tool;
    public PublicFileController(PublicFileService publicFileService, Tool tool) {
        this.publicFileService = publicFileService;
        this.tool = tool;
    }

    @PostMapping
    public ResponseEntity<?> uploadPublicFile(PublicFileUploadDTO publicFileUploadDTO,@AuthenticationPrincipal CustomUserDetails user){
        try {
            publicFileService.uploadPublicFile(publicFileUploadDTO, user);
            return ResponseEntity.ok().body(true);
        } catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
    //바뀐 파일 이름을 return해야한다.
    @PostMapping("/early")
    public ResponseEntity<?> uploadEarlyChunk(
            @RequestParam MultipartFile chunk,
            @RequestParam int chunkIndex,
            @RequestParam int totalChunk,
            @RequestParam String originalFileName,
            @AuthenticationPrincipal CustomUserDetails user){
        //나눈 파일을 저장할 임시 폴더 경로임
        String tempFolderDir = uploadDir + "/" + user.getUserCode() + "/";
        try {
            Path path = Paths.get(tempFolderDir);
            Files.createDirectories(path);  //폴더 만듦
            Path chunkPath = Paths.get(tempFolderDir, "chunk-"+chunkIndex); //꼭 순서대로
            Files.write(chunkPath, chunk.getBytes(), StandardOpenOption.CREATE);
            //업로드 끝났을 때 파일 합치기
            if(chunkIndex == totalChunk -1){
                String fileName = UUID.randomUUID() + "-"+originalFileName;
                String filePath = uploadDir+"/"+fileName;
                try (OutputStream outputStream = new FileOutputStream(filePath)) {
                    for (int i = 0; i < totalChunk; i++) {
                        chunkPath = Paths.get(tempFolderDir, "chunk-" + i);
                        Files.copy(chunkPath, outputStream);
                        Files.delete(chunkPath);
                    }
                }
                Files.delete(path);
                return ResponseEntity.ok().body(fileName);
            }
            return ResponseEntity.ok().body(chunkIndex);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    @PostMapping("/early/small")
    public ResponseEntity<String> uploadSmallFile(@RequestParam MultipartFile file){
        return ResponseEntity.ok().body(tool.upload(file));
    }
    @PostMapping("/image")
    public ResponseEntity<String> uploadEditorImage(@RequestParam MultipartFile file){
        return ResponseEntity.ok().body(tool.upload(file,"public"));
    }
    @GetMapping("/open")
    public ResponseEntity<Page<PublicFileMainDto>> getPublicFile(@RequestParam String category, @RequestParam(defaultValue = "") String searchWord, @RequestParam int page){
        Page<PublicFileMainDto> res = publicFileService.getPublicFile(category,searchWord,page);
        return ResponseEntity.ok().body(res);
    }
    @GetMapping("/open/detail")
    public ResponseEntity<?> getFileDetail(@RequestParam Long fileCode){
        try {
            PublicFileDetailDTO publicFile = publicFileService.getFileDetail(fileCode);
            return ResponseEntity.ok().body(publicFile);
        } catch (EntityNotFoundException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/open/comment")
    public ResponseEntity<List<PublicFileCommentEntity>> getComment(@RequestParam Long fileCode){
        return ResponseEntity.ok().body(publicFileService.getComment(fileCode));
    }
    @GetMapping("/download")
    public ResponseEntity<?> getDownloadLog(@AuthenticationPrincipal CustomUserDetails user){
        if(isAdmin(user.getAuthorities())){
            return ResponseEntity.ok().body(publicFileService.getDownloadLog());
        } else {
            return ResponseEntity.badRequest().body("잘못된 접근입니다.");
        }
    }
    @PostMapping("/open/download")
    private void writeDownloadLog(@RequestParam Long fileCode){
        publicFileService.writeLog(fileCode);
    }
    @PostMapping("/recommend")
    public ResponseEntity<Boolean> recommendPublicFile(@AuthenticationPrincipal CustomUserDetails user, @RequestParam Long fileCode){
        return ResponseEntity.ok().body(publicFileService.recommendPublicFile(user,fileCode));
    }


    @PostMapping("/comment")
    public ResponseEntity<?> writeComment(@RequestParam Long fileCode, @RequestParam String content, @AuthenticationPrincipal CustomUserDetails user){
        return ResponseEntity.ok().body(publicFileService.writeComment(fileCode, content, user.getUserCode()));
    }
    @DeleteMapping
    public ResponseEntity<Boolean> deletePublicFile(@RequestParam Long fileCode, @AuthenticationPrincipal CustomUserDetails user){
        return ResponseEntity.ok().body(publicFileService.deletePublicFile(fileCode, user));
    }
    @DeleteMapping("/comment")
    public ResponseEntity<Boolean> deleteComment(@RequestParam Long commentCode, @AuthenticationPrincipal CustomUserDetails user){
        return ResponseEntity.ok().body(publicFileService.deleteComment(commentCode,user.getUserCode()));
    }
    private boolean isAdmin(Collection<? extends GrantedAuthority> authorities){
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
