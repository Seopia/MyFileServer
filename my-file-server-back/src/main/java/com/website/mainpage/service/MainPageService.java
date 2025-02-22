package com.website.mainpage.service;

import com.website.common.Tool;
import com.website.forum.repository.CommentRepository;
import com.website.forum.repository.ForumRepository;
import com.website.mainpage.dto.UserFolderDTO;
import com.website.mainpage.dto.UserPageDTO;
import com.website.mainpage.dto.UserUploadFileDTO;
import com.website.mainpage.entity.FileEntity;
import com.website.mainpage.entity.FolderEntity;
import com.website.mainpage.entity.MainUserEntity;
import com.website.mainpage.repository.FileRepository;
import com.website.mainpage.repository.FolderRepository;
import com.website.mainpage.repository.MainUserRepository;
import com.website.security.dto.CustomUserDetails;
import com.website.security.entity.User;
import com.website.security.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MainPageService {
    @Value("${file.download-url}")
    private String downloadUrl;
    private final Tool tool;
    private final UserRepository userRepository;
    private final MainUserRepository mainUserRepository;
    private final FileRepository fileRepository;
    private final ForumRepository forumRepository;
    private final CommentRepository commentRepository;
    private final FolderRepository folderRepository;
    public MainPageService(Tool tool, UserRepository userRepository, MainUserRepository mainUserRepository, FileRepository fileRepository, ForumRepository forumRepository, CommentRepository commentRepository, FolderRepository folderRepository) {
        this.tool = tool;
        this.userRepository = userRepository;
        this.mainUserRepository = mainUserRepository;
        this.fileRepository = fileRepository;
        this.forumRepository = forumRepository;
        this.commentRepository = commentRepository;
        this.folderRepository = folderRepository;
    }

    private FileEntity uploadFile(MultipartFile file, String description, CustomUserDetails user, boolean isPrivate){
        FileEntity fileEntity =  new FileEntity();
        fileEntity.setChangedName(tool.upload(file));
        fileEntity.setUploadedAt(LocalDateTime.now());
        fileEntity.setDescription(description+"."+tool.getFileExtension(file));
        fileEntity.setPrivate(isPrivate);
        fileEntity.setSize(file.getSize());
        fileEntity.setFileFullPath(downloadUrl+fileEntity.getChangedName());
        fileEntity.setUploadedByUser(mainUserRepository.findById(user.getUserCode()).orElseThrow());
        fileEntity.setDownload_count(0);
        if(file.getOriginalFilename() != null){
            fileEntity.setOriginalName(StringUtils.cleanPath(file.getOriginalFilename()));
        } else {
            fileEntity.setOriginalName("file");
        }
        return fileRepository.save(fileEntity);
    }

    @Transactional
    public void uploadPublicFile(MultipartFile file, String description, CustomUserDetails user) {
        FileEntity fileEntity = this.uploadFile(file, description, user, false);
        fileRepository.save(fileEntity);
    }
    @Transactional
    public UserUploadFileDTO uploadPrivateFile(MultipartFile file, String description, CustomUserDetails user, Long folderCode) {
        FileEntity fileEntity = this.uploadFile(file, description, user, true);
        fileEntity.setFolder(folderRepository.findById(folderCode).orElseThrow());
        return tool.convertFileEntity(fileRepository.save(fileEntity));
    }
    @Transactional
    public UserUploadFileDTO uploadChunk(String originalFileName, String finalFileName, String description, long fileSize, CustomUserDetails user, Long folderCode) {
        FileEntity f = new FileEntity();
        f.setChangedName(finalFileName);
        f.setUploadedAt(LocalDateTime.now());
        f.setDescription(description+"."+tool.getFileEx(originalFileName));
        f.setFileFullPath(downloadUrl+finalFileName);
        f.setUploadedByUser(mainUserRepository.findById(user.getUserCode()).orElseThrow());
        f.setDownload_count(0);
        f.setOriginalName(originalFileName);
        f.setSize(fileSize);
        f.setPrivate(true);

        f.setFolder(folderRepository.findById(folderCode).orElseThrow());
        return tool.convertFileEntity(fileRepository.save(f));

    }

    public Page<FileEntity> getPublicFiles(int page) {
        Pageable pageable = PageRequest.of(page,15,Sort.by("uploadedAt").descending());
        return fileRepository.getPublicFile(pageable);
    }
    public Page<FileEntity> getMyFile(CustomUserDetails user, int page) {
        Pageable pageable = PageRequest.of(page,10,  Sort.by("uploadedAt").descending());
        return fileRepository.getMyFile(user.getUserCode(),pageable);
    }
    @Transactional
    public void increaseDownloadCount(Long fileCode) {
        FileEntity fileEntity = fileRepository.findById(fileCode).orElseThrow();
        fileEntity.setDownload_count(fileEntity.getDownload_count() + 1);
    }

    public int deleteFile(Long fileCode) {
        Optional<FileEntity> fileEntity = fileRepository.findById(fileCode);
        if(fileEntity.isPresent()){
            FileEntity file = fileEntity.get();
            if(tool.deleteFile(file.getChangedName())){
                fileRepository.deleteById(file.getFileCode());
                return 200;
            } else {
                return 404;
            }
        }else {
            return 400;
        }
    }

    public MainUserEntity getUser(CustomUserDetails user) {
        return mainUserRepository.findById(user.getUserCode()).orElseThrow();
    }

    public UserPageDTO getOtherUser(Long userCode) {
        MainUserEntity user = mainUserRepository.findById(userCode).orElseThrow();
        int writtenPostCount = forumRepository.getUserWrittenPostCount(userCode);
        int writtenCommentCount = commentRepository.getUserWrittenCommentCount(userCode);
        int uploadCount = fileRepository.getUserFileUploadCount(userCode);
        return new UserPageDTO(
                user.getUserCode(),
                user.getId(),
                writtenPostCount,
                writtenCommentCount,
                uploadCount,
                "/icon.png",
                user.getIntroduce()
        );
    }

    @Transactional
    public void modifyUser(UserPageDTO user) {
        User userEntity = userRepository.findByUserCode(user.getUserCode());
        userEntity.setId(user.getUserId());
        userEntity.setIntroduce(user.getIntroduce());
        userRepository.save(userEntity);
    }

    @Transactional
    public Long getUserRootFolder(Long userCode) {
        Long userRootFolderCode = folderRepository.getUserRootFolderCode(userCode);
        if(userRootFolderCode==null){   //처음에 루트 폴더 만들어주기
            FolderEntity newFolderEntity = new FolderEntity();
            newFolderEntity.setUser(userCode);
            newFolderEntity.setFolderName("rootFolder"+userCode);
            folderRepository.save(newFolderEntity);
            userRootFolderCode = folderRepository.getUserRootFolderCode(userCode);
        }
        return userRootFolderCode;
    }

    public UserFolderDTO getDataInFolder(Long folderCode, Long userCode) throws Exception {
        try{
            List<FolderEntity> folders = folderRepository.getFolderInFolder(userCode, folderCode);
            List<FileEntity> files = fileRepository.getFileInFolder(userCode, folderCode);
            return new UserFolderDTO(folderCode, folders, files, "success");
        } catch (Exception e){
            throw new Exception(e.getMessage());
        }
    }

    public FolderEntity createFolder(Long userCode, String folderName, Long folderCode) {
        FolderEntity folder = new FolderEntity();
        if(folderName == null || folderName.equalsIgnoreCase("null") || folderName.length() > 10 || folderName.isBlank()){
            folderName = "새 폴더";
        }
        folder.setFolderName(folderName.trim());
        folder.setParentFolderCode(folderCode);
        folder.setUser(userCode);
        return folderRepository.save(folder);
    }

    @Transactional
    public boolean deleteFolder(Long folderCode, Long userCode) {
        try{
            List<FileEntity> files = fileRepository.getFileInFolder(userCode, folderCode);
            List<FolderEntity> folders = folderRepository.getFolderInFolder(userCode,folderCode);
            folderRepository.deleteAll(folders);
            fileRepository.deleteAll(files);
            folderRepository.deleteById(folderCode);
            return true;
        } catch (Exception e){
            return false;
        }
    }
    @Transactional
    public void modifyFolderName(Long folderCode, String description) {
        FolderEntity folder = folderRepository.findById(folderCode).orElseThrow();
        folder.setFolderName(description);
        folderRepository.save(folder);
    }

    public List<MainUserEntity> getUsers(String id) {
        return mainUserRepository.findAllByUserId("%"+id+"%");
    }


}
