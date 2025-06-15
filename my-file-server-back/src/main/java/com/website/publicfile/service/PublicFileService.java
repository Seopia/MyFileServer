package com.website.publicfile.service;

import com.website.common.Tool;
import com.website.publicfile.dto.PublicFileCommentDto;
import com.website.publicfile.dto.PublicFileDetailDTO;
import com.website.publicfile.dto.PublicFileMainDto;
import com.website.publicfile.dto.PublicFileUploadDTO;
import com.website.publicfile.entity.*;
import com.website.publicfile.repository.*;
import com.website.security.dto.CustomUserDetails;
import com.website.security.entity.User;
import com.website.security.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PublicFileService {
    @Value("${file.download-url}")
    private String downloadUrl;
    private final PublicFileRepository publicFileRepository;
    private final Tool tool;
    private final UserRepository userRepository;
    private final PublicFileRecommendRepository publicFileRecommendRepository;
    private final PublicFileCommentRepository publicFileCommentRepository;
    public PublicFileService(PublicFileRepository publicFileRepository, Tool tool, UserRepository userRepository, PublicFileRecommendRepository publicFileRecommendRepository, PublicFileCommentRepository publicFileCommentRepository) {
        this.publicFileRepository = publicFileRepository;
        this.tool = tool;
        this.userRepository = userRepository;
        this.publicFileRecommendRepository = publicFileRecommendRepository;
        this.publicFileCommentRepository = publicFileCommentRepository;
    }

    public Page<PublicFileMainDto> getPublicFile(String category, String searchWord, int page) {
        Pageable pageable = PageRequest.of(page,9, Sort.by("uploadedAt").descending());
        Page<PublicFileEntity> entities;
        if(category.equals("all")){
            entities = publicFileRepository.getPublicFile(searchWord,pageable);
        } else {
            entities = publicFileRepository.getPublicFileByCategory(category,searchWord,pageable);
        }
        List<PublicFileMainDto> dtoList = entities.getContent().stream().map(entity -> new PublicFileMainDto(
                entity.getFileCode(),
                entity.getUploadedAt(),
                entity.getDownloadCount(),
                entity.getCategory(),
                entity.getTitle(),
                entity.getUser().getId(),
                entity.getUser().getUserCode(),
                entity.getSize(),
                entity.getChangedName()
        )).toList();
        return new PageImpl<>(dtoList, entities.getPageable(), entities.getTotalPages());
    }
    public PublicFileDetailDTO getFileDetail(String fileName) {
        PublicFileEntity e =  publicFileRepository.findByChangedName(fileName);
        int recommendCount = publicFileRecommendRepository.countByPublicFileCode(e.getFileCode());
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
                e.getUser().getUserCode(),
                e.getUser().getId(),
                recommendCount
        );
    }
    public Page<PublicFileCommentDto> getComment(Long fileCode, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createAt").descending());
        return publicFileCommentRepository.findComment(pageable, fileCode);
    }

    @Transactional
    public Boolean recommendPublicFile(CustomUserDetails user, Long fileCode) {
        User userEntity = userRepository.findById(user.getUserCode()).orElseThrow();
        if(publicFileRecommendRepository.existsByUserAndPublicFileCode(userEntity, fileCode)){
            return false;
        } else {
            publicFileRecommendRepository.save(new PublicFileRecommendEntity(
                    userEntity,
                    fileCode,
                    LocalDateTime.now()
            ));
            return true;
        }

    }



    @Transactional
    public PublicFileCommentDto writeComment(Long fileCode, String content, Long userCode) {
        PublicFileCommentEntity p = new PublicFileCommentEntity(
                content,
                LocalDateTime.now(),
                userRepository.findById(userCode).orElseThrow(),
                fileCode
        );
        p = publicFileCommentRepository.save(p);
        return new PublicFileCommentDto(p.getContent(),p.getCreateAt(),p.getPublicFileCommentCode(),p.getUser().getId(),p.getUser().getUserCode());
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
                userRepository.findById(user.getUserCode()).orElseThrow()
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
