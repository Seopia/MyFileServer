package com.website.mainpage.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QFolderEntity is a Querydsl query type for FolderEntity
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QFolderEntity extends EntityPathBase<FolderEntity> {

    private static final long serialVersionUID = -256802858L;

    public static final QFolderEntity folderEntity = new QFolderEntity("folderEntity");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> folderCode = createNumber("folderCode", Long.class);

    public final StringPath folderName = createString("folderName");

    public final NumberPath<Long> groupCode = createNumber("groupCode", Long.class);

    public final NumberPath<Long> parentFolderCode = createNumber("parentFolderCode", Long.class);

    public final NumberPath<Long> user = createNumber("user", Long.class);

    public QFolderEntity(String variable) {
        super(FolderEntity.class, forVariable(variable));
    }

    public QFolderEntity(Path<? extends FolderEntity> path) {
        super(path.getType(), path.getMetadata());
    }

    public QFolderEntity(PathMetadata metadata) {
        super(FolderEntity.class, metadata);
    }

}

