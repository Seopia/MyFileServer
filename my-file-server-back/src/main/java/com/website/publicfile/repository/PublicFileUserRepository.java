package com.website.publicfile.repository;

import com.website.publicfile.entity.PublicFileUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicFileUserRepository extends JpaRepository<PublicFileUserEntity, Long> {
}
