package com.website.publicfile.repository;

import com.website.publicfile.entity.PublicFileRecommendEntity;
import com.website.publicfile.entity.PublicFileUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicFileRecommendRepository extends JpaRepository<PublicFileRecommendEntity,Long> {
    int countByPublicFileCode(Long fileCode);

    boolean existsByUserAndPublicFileCode(PublicFileUserEntity user, Long fileCode);
}
