package com.website.publicfile.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPublicDownloadLogEntity is a Querydsl query type for PublicDownloadLogEntity
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPublicDownloadLogEntity extends EntityPathBase<PublicDownloadLogEntity> {

    private static final long serialVersionUID = -1863142668L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPublicDownloadLogEntity publicDownloadLogEntity = new QPublicDownloadLogEntity("publicDownloadLogEntity");

    public final QPublicFileEntity file;

    public final NumberPath<Long> publicDownLogCode = createNumber("publicDownLogCode", Long.class);

    public final com.website.security.entity.QUser user;

    public QPublicDownloadLogEntity(String variable) {
        this(PublicDownloadLogEntity.class, forVariable(variable), INITS);
    }

    public QPublicDownloadLogEntity(Path<? extends PublicDownloadLogEntity> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPublicDownloadLogEntity(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPublicDownloadLogEntity(PathMetadata metadata, PathInits inits) {
        this(PublicDownloadLogEntity.class, metadata, inits);
    }

    public QPublicDownloadLogEntity(Class<? extends PublicDownloadLogEntity> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.file = inits.isInitialized("file") ? new QPublicFileEntity(forProperty("file"), inits.get("file")) : null;
        this.user = inits.isInitialized("user") ? new com.website.security.entity.QUser(forProperty("user")) : null;
    }

}

