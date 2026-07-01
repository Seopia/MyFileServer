package com.website.group.repository;

import com.website.group.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findAllByGroupCode(Long groupCode);
    Optional<GroupMember> findByGroupCodeAndUserCode(Long groupCode, Long userCode);
    void deleteByGroupCodeAndUserCode(Long groupCode, Long userCode);
}
