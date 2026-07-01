package com.website.publicfile.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPublicFileEntity is a Querydsl query type for PublicFileEntity
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPublicFileEntity extends EntityPathBase<PublicFileEntity> {

    private static final long serialVersionUID = 1635527626L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPublicFileEntity publicFileEntity = new QPublicFileEntity("publicFileEntity");

    public final StringPath category = createString("category");

    public final StringPath changedName = createString("changedName");

    public final StringPath description = createString("description");

    public final NumberPath<Integer> downloadCount = createNumber("downloadCount", Integer.class);

    public final NumberPath<Long> fileCode = createNumber("fileCode", Long.class);

    public final StringPath fileFullPath = createString("fileFullPath");

    public final StringPath originalName = createString("originalName");

    public final NumberPath<Long> size = createNumber("size", Long.class);

    public final StringPath title = createString("title");

    public final DateTimePath<java.time.LocalDateTime> uploadedAt = createDateTime("uploadedAt", java.time.LocalDateTime.class);

    public final com.website.security.entity.QUser user;

    public QPublicFileEntity(String variable) {
        this(PublicFileEntity.class, forVariable(variable), INITS);
    }

    public QPublicFileEntity(Path<? extends PublicFileEntity> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPublicFileEntity(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPublicFileEntity(PathMetadata metadata, PathInits inits) {
        this(PublicFileEntity.class, metadata, inits);
    }

    public QPublicFileEntity(Class<? extends PublicFileEntity> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.website.security.entity.QUser(forProperty("user")) : null;
    }

}

