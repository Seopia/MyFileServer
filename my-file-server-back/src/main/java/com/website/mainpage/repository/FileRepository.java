package com.website.mainpage.repository;

import com.website.mainpage.entity.FileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FileRepository extends JpaRepository<FileEntity, Long> {

    @Query("SELECT f FROM FileEntity f WHERE f.uploadedByUser.userCode=:userCode")
    Page<FileEntity> getMyFile(Long userCode, Pageable pageable);

    @Query("SELECT f FROM FileEntity f WHERE f.isPrivate=false")
    Page<FileEntity> getPublicFile(Pageable pageable);
    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.uploadedByUser.userCode=:userCode")
    int getUserFileUploadCount(Long userCode);

    /**
     * 어떤 폴더 안에 파일을 모두 가져온다.
     * @param userCode 유저 기본 키
     * @param folderCode 폴더 기본 키
     * @return 파일 List
     */
    @Query("SELECT f FROM FileEntity f WHERE f.uploadedByUser.userCode = :userCode AND f.folder.folderCode = :folderCode")
    List<FileEntity> getFileInFolder(Long userCode, Long folderCode);
}
