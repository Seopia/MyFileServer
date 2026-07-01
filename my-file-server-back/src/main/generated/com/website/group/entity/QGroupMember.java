package com.website.group.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QGroupMember is a Querydsl query type for GroupMember
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QGroupMember extends EntityPathBase<GroupMember> {

    private static final long serialVersionUID = -596078371L;

    public static final QGroupMember groupMember = new QGroupMember("groupMember");

    public final NumberPath<Long> groupCode = createNumber("groupCode", Long.class);

    public final NumberPath<Long> groupMemberCode = createNumber("groupMemberCode", Long.class);

    public final DatePath<java.time.LocalDate> joinDate = createDate("joinDate", java.time.LocalDate.class);

    public final NumberPath<Long> userCode = createNumber("userCode", Long.class);

    public QGroupMember(String variable) {
        super(GroupMember.class, forVariable(variable));
    }

    public QGroupMember(Path<? extends GroupMember> path) {
        super(path.getType(), path.getMetadata());
    }

    public QGroupMember(PathMetadata metadata) {
        super(GroupMember.class, metadata);
    }

}

