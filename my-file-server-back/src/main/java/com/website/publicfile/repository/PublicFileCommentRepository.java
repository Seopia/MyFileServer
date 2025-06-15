package com.website.publicfile.repository;

import com.website.publicfile.dto.PublicFileCommentDto;
import com.website.publicfile.entity.PublicFileCommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PublicFileCommentRepository extends JpaRepository<PublicFileCommentEntity, Long> {
    List<PublicFileCommentEntity> findByFileCodeOrderByCreateAtDesc(Long fileCode);

    @Query("SELECT new com.website.publicfile.dto.PublicFileCommentDto(pc.content, pc.createAt, pc.publicFileCommentCode,pc.user.id, pc.user.userCode) FROM PublicFileCommentEntity pc WHERE pc.fileCode=:fileCode")
    Page<PublicFileCommentDto> findComment(Pageable pageable, Long fileCode);
}
