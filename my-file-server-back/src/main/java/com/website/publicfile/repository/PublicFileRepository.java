package com.website.publicfile.repository;

import com.website.publicfile.entity.PublicFileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PublicFileRepository extends JpaRepository<PublicFileEntity, Long> {

    @Query("SELECT p FROM PublicFileEntity p WHERE p.category=:category AND p.title LIKE CONCAT('%',:searchWord,'%')")
    Page<PublicFileEntity> getPublicFileByCategory(String category, String searchWord, Pageable pageable);
    @Query("SELECT p FROM PublicFileEntity p WHERE p.title LIKE CONCAT('%',:searchWord,'%')")
    Page<PublicFileEntity> getPublicFile(String searchWord, Pageable pageable);

    PublicFileEntity findByChangedName(String fileName);
}
