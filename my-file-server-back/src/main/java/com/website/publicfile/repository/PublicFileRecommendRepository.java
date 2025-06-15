package com.website.publicfile.repository;

import com.website.publicfile.entity.PublicFileRecommendEntity;
import com.website.security.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicFileRecommendRepository extends JpaRepository<PublicFileRecommendEntity,Long> {
    int countByPublicFileCode(Long fileCode);

    boolean existsByUserAndPublicFileCode(User user, Long fileCode);
}
