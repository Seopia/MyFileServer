package com.website.group.service;

import com.website.common.Tool;
import com.website.group.dto.GroupCreateDTO;
import com.website.group.dto.GroupManagementDTO;
import com.website.group.entity.Group;
import com.website.group.entity.GroupMember;
import com.website.group.repository.GroupMemberRepository;
import com.website.group.repository.GroupRepository;
import com.website.mainpage.dto.UserFolderDTO;
import com.website.mainpage.dto.UserUploadFileDTO;
import com.website.mainpage.entity.FileEntity;
import com.website.mainpage.entity.FolderEntity;
import com.website.mainpage.entity.MainUserEntity;
import com.website.mainpage.repository.FileRepository;
import com.website.mainpage.repository.FolderRepository;
import com.website.mainpage.repository.MainUserRepository;
import com.website.repository.UserRepository;
import com.website.security.dto.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GroupService {
    @Value("${file.download-url}")
    private String downloadUrl;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final MainUserRepository mainUserRepository;
    private final UserRepository userRepository;
    private final Tool tool;

    public GroupService(GroupRepository groupRepository, GroupMemberRepository groupMemberRepository,
                        FolderRepository folderRepository, FileRepository fileRepository,
                        MainUserRepository mainUserRepository, UserRepository userRepository, Tool tool) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
        this.mainUserRepository = mainUserRepository;
        this.userRepository = userRepository;
        this.tool = tool;
    }

    @Transactional
    public void createGroup(GroupCreateDTO groupCreateDTO, Long userCode) {
        Group group = new Group(groupCreateDTO.getGroupName(), LocalDate.now(), groupCreateDTO.getDescription(), userCode);
        Group newGroup = groupRepository.save(group);

        List<GroupMember> groupMembers = new ArrayList<>();
        for (Long g : groupCreateDTO.getUserCodes()) {
            GroupMember groupMember = new GroupMember();
            groupMember.setGroupCode(newGroup.getGroupCode());
            groupMember.setJoinDate(LocalDate.now());
            groupMember.setUserCode(g);
            groupMembers.add(groupMember);
        }
        // Bug Fix: newGroup.getGroupCode() 사용 (저장 후 ID가 할당된 엔티티)
        groupMembers.add(new GroupMember(newGroup.getGroupCode(), userCode, LocalDate.now()));
        groupMemberRepository.saveAll(groupMembers);

        FolderEntity folder = new FolderEntity();
        folder.setFolderName("group" + newGroup.getGroupCode() + "RootFolder");
        folder.setGroupCode(newGroup.getGroupCode());
        folder.setCreatedAt(LocalDateTime.now());
        folderRepository.save(folder);
    }

    public List<Group> getMyGroup(CustomUserDetails user) {
        return groupRepository.getMyGroup(user.getUserCode());
    }

    public Long getGroupRootFolderCode(Long groupCode) {
        return folderRepository.getGroupRootFolderCode(groupCode);
    }

    public UserFolderDTO getDataInGroupFolder(Long folderCode, Long groupCode) throws Exception {
        try {
            List<FolderEntity> folders = folderRepository.getFolderInFolderGroup(folderCode, groupCode);
            List<FileEntity> files = fileRepository.getFileInGroupFolder(folderCode);
            return new UserFolderDTO(folderCode, folders, files, "success");
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    @Transactional
    public FolderEntity createGroupFolder(Long groupCode, String folderName, Long folderCode) {
        FolderEntity folder = new FolderEntity();
        if (folderName == null || folderName.equalsIgnoreCase("null") || folderName.length() > 10 || folderName.isBlank()) {
            folderName = "새 폴더";
        }
        folder.setFolderName(folderName.trim());
        folder.setParentFolderCode(folderCode);
        folder.setGroupCode(groupCode);
        return folderRepository.save(folder);
    }

    public Group getMyGroup(Long groupCode) {
        return groupRepository.findById(groupCode).orElseThrow();
    }

    @Transactional
    public boolean deleteGroup(Long groupCode) {
        try {
            List<FolderEntity> folders = folderRepository.findAllByGroupCode(groupCode);
            List<FileEntity> fileEntities = fileRepository.findAllByFolderIn(folders);
            // 서버 실제 파일 삭제
            for (FileEntity f : fileEntities) {
                tool.deleteFile(f.getChangedName());
            }
            // DB 삭제 순서: 파일 → 폴더 → 멤버 → 그룹
            fileRepository.deleteAll(fileEntities);
            folderRepository.deleteAll(folders);
            groupMemberRepository.deleteAll(groupMemberRepository.findAllByGroupCode(groupCode));
            groupRepository.deleteById(groupCode);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public List<MainUserEntity> getGroupMembers(Long groupCode) {
        List<GroupMember> members = groupMemberRepository.findAllByGroupCode(groupCode);
        List<Long> userCodes = new ArrayList<>();
        for (GroupMember g : members) {
            userCodes.add(g.getUserCode());
        }
        return mainUserRepository.findAllByUserCodeIn(userCodes);
    }

    /**
     * 그룹 폴더에 파일 단건 업로드
     */
    @Transactional
    public UserUploadFileDTO uploadGroupFile(MultipartFile file, String description, CustomUserDetails user, Long folderCode) {
        FileEntity fileEntity = new FileEntity();
        fileEntity.setChangedName(tool.upload(file));
        fileEntity.setUploadedAt(LocalDateTime.now());
        fileEntity.setDescription(description + "." + tool.getFileExtension(file));
        fileEntity.setPrivate(true);
        fileEntity.setSize(file.getSize());
        fileEntity.setFileFullPath(downloadUrl + fileEntity.getChangedName());
        fileEntity.setUser(userRepository.findById(user.getUserCode()).orElseThrow());
        fileEntity.setDownload_count(0);
        if (file.getOriginalFilename() != null) {
            fileEntity.setOriginalName(StringUtils.cleanPath(file.getOriginalFilename()));
        } else {
            fileEntity.setOriginalName("file");
        }
        fileEntity.setFolder(folderRepository.findById(folderCode).orElseThrow());
        return tool.convertFileEntity(fileRepository.save(fileEntity));
    }

    /**
     * 그룹 폴더에 청크 업로드 완료 후 DB 등록
     */
    @Transactional
    public UserUploadFileDTO uploadGroupChunk(String originalFileName, String finalFileName, String description,
                                               long fileSize, CustomUserDetails user, Long folderCode) {
        FileEntity f = new FileEntity();
        f.setChangedName(finalFileName);
        f.setUploadedAt(LocalDateTime.now());
        f.setDescription(description + "." + tool.getFileEx(originalFileName));
        f.setFileFullPath(downloadUrl + finalFileName);
        f.setUser(userRepository.findById(user.getUserCode()).orElseThrow());
        f.setDownload_count(0);
        f.setOriginalName(originalFileName);
        f.setSize(fileSize);
        f.setPrivate(true);
        f.setFolder(folderRepository.findById(folderCode).orElseThrow());
        return tool.convertFileEntity(fileRepository.save(f));
    }

    /**
     * 청크 병합 후 그룹 DB 등록 — Controller에서 호출
     */
    @Transactional
    public UserUploadFileDTO mergeAndSaveGroupChunk(int totalChunks, String tempFileDir, String finalFilePath,
                                                     String finalFileName, String originalFileName, String description,
                                                     long fileSize, CustomUserDetails user, Long folderCode) throws java.io.IOException {
        tool.mergeChunks(totalChunks, tempFileDir, finalFilePath);
        return uploadGroupChunk(originalFileName, finalFileName, description, fileSize, user, folderCode);
    }


    /**
     * 그룹 파일 삭제 (서버 파일 + DB 레코드)
     */
    @Transactional
    public boolean deleteGroupFile(Long fileCode) {
        Optional<FileEntity> fileEntity = fileRepository.findById(fileCode);
        if (fileEntity.isPresent()) {
            FileEntity file = fileEntity.get();
            tool.deleteFile(file.getChangedName());
            fileRepository.deleteById(file.getFileCode());
            return true;
        }
        return false;
    }

    /**
     * 그룹 폴더 삭제 (하위 파일 포함)
     */
    @Transactional
    public boolean deleteGroupFolder(Long folderCode) {
        try {
            List<FileEntity> files = fileRepository.getFileInGroupFolder(folderCode);
            for (FileEntity f : files) {
                tool.deleteFile(f.getChangedName());
            }
            fileRepository.deleteAll(files);
            folderRepository.deleteById(folderCode);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 그룹 관리 정보 조회 (그룹 정보 + 멤버 목록)
     */
    public GroupManagementDTO getGroupManagement(Long groupCode) {
        Group group = groupRepository.findById(groupCode).orElseThrow();
        List<GroupMember> members = groupMemberRepository.findAllByGroupCode(groupCode);
        return new GroupManagementDTO(group.getName(), group.getDescription(), group.getCreateAt(), members);
    }

    /**
     * 그룹 정보 수정 (이름, 설명)
     */
    @Transactional
    public void updateGroupInfo(Long groupCode, String name, String description) {
        Group group = groupRepository.findById(groupCode).orElseThrow();
        group.setName(name);
        group.setDescription(description);
        groupRepository.save(group);
    }

    /**
     * 그룹 멤버 추가 (초대)
     */
    @Transactional
    public boolean addMemberToGroup(Long groupCode, Long userCode) {
        Optional<GroupMember> existingMember = groupMemberRepository.findByGroupCodeAndUserCode(groupCode, userCode);
        if (existingMember.isPresent()) {
            return false;
        }
        GroupMember groupMember = new GroupMember(groupCode, userCode, LocalDate.now());
        groupMemberRepository.save(groupMember);
        return true;
    }

    /**
     * 그룹 멤버 추방
     */
    @Transactional
    public boolean removeMemberFromGroup(Long groupCode, Long userCode) {
        Group group = groupRepository.findById(groupCode).orElseThrow();
        if (group.getManager().equals(userCode)) {
            return false; // 그룹장은 스스로 나갈 수 없음 (그룹을 삭제해야 함)
        }
        groupMemberRepository.deleteByGroupCodeAndUserCode(groupCode, userCode);
        return true;
    }

    public boolean isGroupMember(Long groupCode, Long userCode) {
        if (groupCode == null || userCode == null) return false;
        return groupMemberRepository.findByGroupCodeAndUserCode(groupCode, userCode).isPresent();
    }

    public boolean isGroupManager(Long groupCode, Long userCode) {
        if (groupCode == null || userCode == null) return false;
        return groupRepository.findById(groupCode)
                .map(g -> g.getManager().equals(userCode))
                .orElse(false);
    }

    public boolean isFolderGroupMember(Long folderCode, Long userCode) {
        if (folderCode == null || userCode == null) return false;
        FolderEntity folder = folderRepository.findById(folderCode).orElse(null);
        if (folder == null || folder.getGroupCode() == null) return false;
        return isGroupMember(folder.getGroupCode(), userCode);
    }

    public boolean isGroupExist(Long groupCode) {
        if (groupCode == null) return false;
        return groupRepository.existsById(groupCode);
    }
}
