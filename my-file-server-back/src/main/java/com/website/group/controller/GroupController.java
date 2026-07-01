package com.website.group.controller;

import com.website.group.dto.GroupCreateDTO;
import com.website.group.dto.GroupManagementDTO;
import com.website.group.entity.Group;
import com.website.group.service.GroupService;
import com.website.mainpage.dto.UserFolderDTO;
import com.website.mainpage.dto.UserUploadFileDTO;
import com.website.mainpage.entity.FolderEntity;
import com.website.mainpage.entity.MainUserEntity;
import com.website.security.dto.CustomUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.UUID;

@RestController
public class GroupController {
    @Value("${file.upload-dir}")
    private String uploadDir;
    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping("/my-group")
    public ResponseEntity<List<Group>> getMyGroups(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok().body(groupService.getMyGroup(user));
    }

    @GetMapping("/group")
    public ResponseEntity<?> getGroup(@RequestParam Long groupCode, @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupExist(groupCode)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("존재하지 않는 그룹입니다.");
        }
        if (!groupService.isGroupMember(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 그룹의 멤버가 아닙니다.");
        }
        return ResponseEntity.ok().body(groupService.getMyGroup(groupCode));
    }

    @PostMapping("/group")
    public ResponseEntity<?> createGroup(GroupCreateDTO groupCreateDTO, @AuthenticationPrincipal CustomUserDetails user) {
        groupService.createGroup(groupCreateDTO, user.getUserCode());
        return ResponseEntity.ok().body(groupCreateDTO);
    }

    @GetMapping("/group-root-folder")
    public ResponseEntity<?> getGroupRootFolder(@RequestParam Long groupCode, @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupExist(groupCode)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("존재하지 않는 그룹입니다.");
        }
        if (!groupService.isGroupMember(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 그룹의 멤버가 아닙니다.");
        }
        return ResponseEntity.ok().body(groupService.getGroupRootFolderCode(groupCode));
    }

    @GetMapping("/group/file")
    public ResponseEntity<?> getDataInGroupFolder(
            @RequestParam Long folderCode, 
            @RequestParam Long groupCode,
            @AuthenticationPrincipal CustomUserDetails user) {
        try {
            if (!groupService.isGroupMember(groupCode, user.getUserCode())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new UserFolderDTO("해당 그룹의 멤버가 아닙니다."));
            }
            return ResponseEntity.ok().body(groupService.getDataInGroupFolder(folderCode, groupCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/group/folder")
    public ResponseEntity<?> createGroupFolder(
            @RequestParam Long groupCode, 
            @RequestParam String folderName, 
            @RequestParam Long folderCode,
            @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupMember(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 그룹의 멤버가 아닙니다.");
        }
        return ResponseEntity.ok().body(groupService.createGroupFolder(groupCode, folderName, folderCode));
    }

    @DeleteMapping("/group")
    public ResponseEntity<?> deleteGroup(@RequestParam Long groupCode, @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupManager(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("그룹 삭제 권한이 없습니다.");
        }
        return ResponseEntity.ok().body(groupService.deleteGroup(groupCode));
    }

    @GetMapping("/group/member")
    public ResponseEntity<?> getMembers(@RequestParam Long groupCode, @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupMember(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("그룹 멤버가 아닙니다.");
        }
        return ResponseEntity.ok().body(groupService.getGroupMembers(groupCode));
    }

    /**
     * 그룹 관리 정보 조회 (그룹 정보 + 멤버 목록)
     */
    @GetMapping("/group/management/{groupCode}")
    public ResponseEntity<?> getGroupAllData(@PathVariable Long groupCode, @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupManager(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("그룹 관리 권한이 없습니다.");
        }
        return ResponseEntity.ok().body(groupService.getGroupManagement(groupCode));
    }

    /**
     * 그룹 폴더에 단건 파일 업로드
     */
    @PostMapping("/group/upload")
    public ResponseEntity<?> uploadGroupFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam String description,
            @RequestParam Long folderCode,
            @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isFolderGroupMember(folderCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 그룹의 멤버가 아닙니다.");
        }
        return ResponseEntity.ok().body(groupService.uploadGroupFile(file, description, user, folderCode));
    }

    /**
     * 그룹 폴더에 청크 업로드
     */
    @PostMapping("/group/chunk")
    public ResponseEntity<?> uploadGroupChunk(
            @RequestParam("chunk") MultipartFile chunk,
            @RequestParam("chunkIndex") int chunkIndex,
            @RequestParam("totalChunks") int totalChunks,
            @RequestParam("originalFileName") String originalFileName,
            @RequestParam("description") String description,
            @RequestParam("fileSize") long fileSize,
            @RequestParam("folderCode") Long folderCode,
            @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isFolderGroupMember(folderCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 그룹의 멤버가 아닙니다.");
        }
        try {
            String tempFileDir = uploadDir + "/" + user.getUserCode() + "/";
            Files.createDirectories(Paths.get(tempFileDir));

            Path chunkPath = Paths.get(tempFileDir, "chunk-" + chunkIndex);
            Files.write(chunkPath, chunk.getBytes(), StandardOpenOption.CREATE);

            if (chunkIndex == totalChunks - 1) {
                String finalFileName = UUID.randomUUID() + "-" + originalFileName;
                String finalFilePath = uploadDir + "/" + finalFileName;
                // Tool의 공통 mergeChunks 사용
                // (GroupService에서 tool을 직접 접근할 수 없으므로 여기서 병합 후 DB 등록)
                UserUploadFileDTO r = groupService.mergeAndSaveGroupChunk(
                        totalChunks, tempFileDir, finalFilePath, finalFileName,
                        originalFileName, description, fileSize, user, folderCode);
                return ResponseEntity.ok(r);
            }
            return ResponseEntity.ok(new UserUploadFileDTO("Chunk " + chunkIndex + " uploaded"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Chunk upload failed: " + e.getMessage());
        }
    }

    /**
     * 그룹 파일 삭제
     */
    @DeleteMapping("/group/file")
    public ResponseEntity<Boolean> deleteGroupFile(@RequestParam Long fileCode) {
        return ResponseEntity.ok().body(groupService.deleteGroupFile(fileCode));
    }

    /**
     * 그룹 폴더 삭제 (하위 파일 포함)
     */
    @DeleteMapping("/group/folder")
    public ResponseEntity<Boolean> deleteGroupFolder(@RequestParam Long folderCode) {
        return ResponseEntity.ok().body(groupService.deleteGroupFolder(folderCode));
    }

    /**
     * 그룹 정보 수정
     */
    @PostMapping("/group/update")
    public ResponseEntity<?> updateGroup(
            @RequestParam Long groupCode,
            @RequestParam String name,
            @RequestParam String description,
            @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupManager(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("그룹 관리 권한이 없습니다.");
        }
        groupService.updateGroupInfo(groupCode, name, description);
        return ResponseEntity.ok().build();
    }

    /**
     * 그룹 멤버 추가
     */
    @PostMapping("/group/member")
    public ResponseEntity<?> addMember(
            @RequestParam Long groupCode,
            @RequestParam Long userCode,
            @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupManager(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("그룹 관리 권한이 없습니다.");
        }
        boolean success = groupService.addMemberToGroup(groupCode, userCode);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("이미 가입된 멤버이거나 추가할 수 없습니다.");
        }
    }

    /**
     * 그룹 멤버 추방
     */
    @DeleteMapping("/group/member")
    public ResponseEntity<?> removeMember(
            @RequestParam Long groupCode,
            @RequestParam Long userCode,
            @AuthenticationPrincipal CustomUserDetails user) {
        if (!groupService.isGroupManager(groupCode, user.getUserCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("그룹 관리 권한이 없습니다.");
        }
        boolean success = groupService.removeMemberFromGroup(groupCode, userCode);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("그룹장은 추방하거나 탈퇴할 수 없습니다.");
        }
    }
}
