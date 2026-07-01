package com.website.security.repository;

import com.website.mainpage.dto.UserPageDTO;
import com.website.security.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * 유저가 존재하는지 확인하는 메서드
     * @param accountId 확인할 ID
     * @return true or false
     */
    Boolean existsById(String accountId);

    User findByUserCode(Long userCode);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginTime = :now WHERE u.userCode = :userCode")
    void updateUserLoginTime(Long userCode, LocalDateTime now);


    Boolean existsByMemo(String value);

    @Query("""
SELECT new com.website.mainpage.dto.UserPageDTO(
    u.userCode,
    u.id,
    u.profileImage,
    u.memo,
    (SELECT COUNT(p) FROM PublicFileEntity p WHERE p.user.userCode = u.userCode),
    (SELECT COUNT(pc) FROM PublicFileCommentEntity pc WHERE pc.user.userCode = u.userCode),
    (SELECT COUNT(f) FROM FileEntity f WHERE f.user.userCode = u.userCode)
)
FROM User u
WHERE u.userCode = :userCode
""")
    UserPageDTO findUserPageData(Long userCode);
    @Query("SELECT u FROM User u WHERE u.id = :username")
    User findByUserId(String username);
}
