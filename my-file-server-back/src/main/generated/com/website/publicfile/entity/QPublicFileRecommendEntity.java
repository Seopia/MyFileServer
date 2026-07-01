package com.website.publicfile.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPublicFileRecommendEntity is a Querydsl query type for PublicFileRecommendEntity
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPublicFileRecommendEntity extends EntityPathBase<PublicFileRecommendEntity> {

    private static final long serialVersionUID = 1522995128L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPublicFileRecommendEntity publicFileRecommendEntity = new QPublicFileRecommendEntity("publicFileRecommendEntity");

    public final NumberPath<Long> publicFileCode = createNumber("publicFileCode", Long.class);

    public final NumberPath<Long> publicFileRecommendCode = createNumber("publicFileRecommendCode", Long.class);

    public final DateTimePath<java.time.LocalDateTime> recommendDate = createDateTime("recommendDate", java.time.LocalDateTime.class);

    public final com.website.security.entity.QUser user;

    public QPublicFileRecommendEntity(String variable) {
        this(PublicFileRecommendEntity.class, forVariable(variable), INITS);
    }

    public QPublicFileRecommendEntity(Path<? extends PublicFileRecommendEntity> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPublicFileRecommendEntity(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPublicFileRecommendEntity(PathMetadata metadata, PathInits inits) {
        this(PublicFileRecommendEntity.class, metadata, inits);
    }

    public QPublicFileRecommendEntity(Class<? extends PublicFileRecommendEntity> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.website.security.entity.QUser(forProperty("user")) : null;
    }

}

