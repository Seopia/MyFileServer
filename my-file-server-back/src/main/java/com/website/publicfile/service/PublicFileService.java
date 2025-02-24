package com.website.publicfile.service;

import com.website.common.Tool;
import com.website.publicfile.dto.PublicFileDetailDTO;
import com.website.publicfile.dto.PublicFileUploadDTO;
import com.website.publicfile.entity.*;
import com.website.publicfile.repository.*;
import com.website.security.dto.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PublicFileService {
    @Value("${file.download-url}")
    private String downloadUrl;
    private final PublicFileRepository publicFileRepository;
    private final Tool tool;
    private final PublicFileUserRepository publicFileUserRepository;
    private final PublicDownloadLogRepository publicDownloadLogRepository;
    private final PublicFileRecommendRepository publicFileRecommendRepository;
    private final PublicFileCommentRepository publicFileCommentRepository;
    public PublicFileService(PublicFileRepository publicFileRepository, Tool tool, PublicFileUserRepository publicFileUserRepository, PublicDownloadLogRepository publicDownloadLogRepository, PublicFileRecommendRepository publicFileRecommendRepository, PublicFileCommentRepository publicFileCommentRepository) {
        this.publicFileRepository = publicFileRepository;
        this.tool = tool;
        this.publicFileUserRepository = publicFileUserRepository;
        this.publicDownloadLogRepository = publicDownloadLogRepository;
        this.publicFileRecommendRepository = publicFileRecommendRepository;
        this.publicFileCommentRepository = publicFileCommentRepository;
    }

    public Page<PublicFileEntity> getPublicFile(String category, String searchWord, int page) {
        Pageable pageable = PageRequest.of(page,9, Sort.by("uploadedAt").descending());
        System.out.println(searchWord);
        Page<PublicFileEntity> entities;
        if(category.equals("all")){
            entities = publicFileRepository.getPublicFile(searchWord,pageable);
        } else {
            entities = publicFileRepository.getPublicFileByCategory(category,searchWord,pageable);
        }
        return entities;

    }

    @Transactional
    public void writeLog(Long userCode, Long fileCode) {
        PublicFileEntity publicFileEntity = publicFileRepository.findById(fileCode).orElseThrow();
        publicFileEntity.setDownloadCount(publicFileEntity.getDownloadCount() + 1);
        PublicFileUserEntity publicFileUserEntity = publicFileUserRepository.findById(userCode).orElseThrow();
        publicDownloadLogRepository.save(new PublicDownloadLogEntity(publicFileUserEntity,publicFileEntity));
    }

    public List<PublicDownloadLogEntity> getDownloadLog() {
        return publicDownloadLogRepository.findAll();
    }

    public PublicFileDetailDTO getFileDetail(Long fileCode) {
        PublicFileEntity e =  publicFileRepository.findById(fileCode).orElseThrow(
                ()->new EntityNotFoundException("파일을 찾을 수 없습니다."));
        int recommendCount = publicFileRecommendRepository.countByPublicFileCode(fileCode);
        System.out.println("@@@@@@@@@@@@@"+fileCode+"가 "+recommendCount+"개");
        return new PublicFileDetailDTO(
            e.getFileCode(),
                e.getChangedName(),
                e.getUploadedAt(),
                e.getDownloadCount(),
                e.getOriginalName(),
                e.getSize(),
                e.getTitle(),
                e.getFileFullPath(),
                e.getCategory(),
                e.getDescription(),
                e.getUser(),
                recommendCount
        );

    }

    @Transactional
    public Boolean recommendPublicFile(CustomUserDetails user, Long fileCode) {
        PublicFileUserEntity publicFileUserEntity = publicFileUserRepository.findById(user.getUserCode()).orElseThrow();
        if(publicFileRecommendRepository.existsByUserAndPublicFileCode(publicFileUserEntity, fileCode)){
            return false;
        } else {
            publicFileRecommendRepository.save(new PublicFileRecommendEntity(
                    publicFileUserEntity,
                    fileCode,
                    LocalDateTime.now()
            ));
            return true;
        }

    }

    public List<PublicFileCommentEntity> getComment(Long fileCode) {
        List<PublicFileCommentEntity> comments = publicFileCommentRepository.findByFileCodeOrderByCreateAtDesc(fileCode);
        return comments;
    }

    @Transactional
    public PublicFileCommentEntity writeComment(Long fileCode, String content, Long userCode) {
        PublicFileCommentEntity p = new PublicFileCommentEntity(
                content,
                LocalDateTime.now(),
                publicFileUserRepository.findById(userCode).orElseThrow(),
                fileCode
        );
        return publicFileCommentRepository.save(p);
    }

    @Transactional
    public void uploadPublicFile(PublicFileUploadDTO dto, CustomUserDetails user) {
        PublicFileEntity en = new PublicFileEntity(
                dto.getChangedName(),
                LocalDateTime.now(),
                0,
                dto.getOriginalName(),
                dto.getSize(),
                dto.getTitle(),
                downloadUrl+dto.getChangedName(),
                dto.getCategory(),
                dto.getDescription(),
                publicFileUserRepository.findById(user.getUserCode()).orElseThrow()
        );
        publicFileRepository.save(en);
    }
    @Transactional
    public Boolean deletePublicFile(Long fileCode, CustomUserDetails user) {
        PublicFileEntity file = publicFileRepository.findById(fileCode).orElseThrow();
        if(file.getUser().getUserCode().equals(user.getUserCode())){
            publicFileRepository.deleteById(fileCode);
            tool.deleteFile(file.getChangedName());
            return true;
        } else {
            return false;
        }
    }
    public Boolean deleteComment(Long commentCode, Long userCode) {
        PublicFileCommentEntity en = publicFileCommentRepository.findById(commentCode).orElseThrow();
        if(en.getUser().getUserCode().equals(userCode)){
            publicFileCommentRepository.deleteById(commentCode);
            return true;
        }else{
            return false;
        }
    }
}
