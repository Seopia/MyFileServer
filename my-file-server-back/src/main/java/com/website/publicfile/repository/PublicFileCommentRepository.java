package com.website.publicfile.repository;

import com.website.publicfile.entity.PublicFileCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PublicFileCommentRepository extends JpaRepository<PublicFileCommentEntity, Long> {
    List<PublicFileCommentEntity> findByFileCodeOrderByCreateAtDesc(Long fileCode);
}
