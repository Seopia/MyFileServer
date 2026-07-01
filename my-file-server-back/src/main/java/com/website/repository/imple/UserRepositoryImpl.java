package com.website.repository.imple;

import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.website.admin.dto.AdminUserDto;
import com.website.repository.custom.UserRepositoryCustom;
import com.website.repository.enums.UserSort;
import com.website.security.entity.User;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.website.security.entity.QUser.user;
@Repository
public class UserRepositoryImpl implements UserRepositoryCustom {
    //닉네임(memo) 검색, 활성화 비활성화,
    private final JPAQueryFactory queryFactory;

    public UserRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public Page<AdminUserDto> searchUserForAdmin(String keyword, UserSort sortFiled, int page, boolean asc) {
        // 보고 싶은게 뭘까? 먼저 모든 계정 정보 조회는 기본 정렬
        // 권한 관리자 우선 정렬
        // 비활성화 우선 정렬
        // 그리고 검색
        // 검색 후에도 정렬 옵션 유지

        // 기본 정렬은 lastLoginTime
        // 권한 관리자 우선은 userRole 옵션 선택하면 관리자 우선 정렬
        // 비활성화 우선은 enable 옵션 선택하면 비활성화 우선 정렬
        // 검색 후에도 정렬 옵션 유지

        //받아와야할 파라미터
        // 페이지, 정렬 옵션, 검색어

        List<User> content = queryFactory.selectFrom(user)
                .where(nicknameContains(keyword))
                .orderBy(toOrderSpecifier(sortFiled, asc))
                .offset((long) page * 10)
                .limit(10)
                .fetch();
        List<AdminUserDto> dtos = content.stream().map((user)-> new AdminUserDto(user.getUserCode(), user.getId(),user.getUserRole(),user.isEnable(),user.getMemo(),user.getLastLoginTime(),user.getProfileImage())).toList();

        Long total = queryFactory.select(user.count()).from(user).where(nicknameContains(keyword))
                .fetchOne();
        return new PageImpl<>(dtos, PageRequest.of(page, 10), total==null?0:total);
    }
    //조건 메서드가 null 이면 자동으로 무시된다.
    private BooleanExpression nicknameContains(String keyword){
        return (keyword == null || keyword.isBlank()) ? null : user.memo.containsIgnoreCase(keyword);
    }
    private OrderSpecifier<?> toOrderSpecifier(UserSort field, boolean asc) {
        PathBuilder<User> path = new PathBuilder<>(User.class, "user");
        return new OrderSpecifier(
                asc ? Order.ASC : Order.DESC,
                path.get(field.getField())
        );
    }
}
