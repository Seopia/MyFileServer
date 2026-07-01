package com.website.publicfile.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPublicFileCommentEntity is a Querydsl query type for PublicFileCommentEntity
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPublicFileCommentEntity extends EntityPathBase<PublicFileCommentEntity> {

    private static final long serialVersionUID = 1014075739L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPublicFileCommentEntity publicFileCommentEntity = new QPublicFileCommentEntity("publicFileCommentEntity");

    public final StringPath content = createString("content");

    public final DateTimePath<java.time.LocalDateTime> createAt = createDateTime("createAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> fileCode = createNumber("fileCode", Long.class);

    public final NumberPath<Long> parentCommentCode = createNumber("parentCommentCode", Long.class);

    public final NumberPath<Long> publicFileCommentCode = createNumber("publicFileCommentCode", Long.class);

    public final com.website.security.entity.QUser user;

    public QPublicFileCommentEntity(String variable) {
        this(PublicFileCommentEntity.class, forVariable(variable), INITS);
    }

    public QPublicFileCommentEntity(Path<? extends PublicFileCommentEntity> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPublicFileCommentEntity(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPublicFileCommentEntity(PathMetadata metadata, PathInits inits) {
        this(PublicFileCommentEntity.class, metadata, inits);
    }

    public QPublicFileCommentEntity(Class<? extends PublicFileCommentEntity> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.website.security.entity.QUser(forProperty("user")) : null;
    }

}

