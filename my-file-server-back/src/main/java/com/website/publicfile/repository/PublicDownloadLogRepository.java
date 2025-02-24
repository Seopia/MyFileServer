package com.website.publicfile.repository;

import com.website.publicfile.entity.PublicDownloadLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicDownloadLogRepository extends JpaRepository<PublicDownloadLogEntity, Long> {
}
