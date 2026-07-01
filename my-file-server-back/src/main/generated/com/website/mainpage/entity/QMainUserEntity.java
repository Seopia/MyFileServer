package com.website.mainpage.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QMainUserEntity is a Querydsl query type for MainUserEntity
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QMainUserEntity extends EntityPathBase<MainUserEntity> {

    private static final long serialVersionUID = 898596556L;

    public static final QMainUserEntity mainUserEntity = new QMainUserEntity("mainUserEntity");

    public final StringPath id = createString("id");

    public final StringPath introduce = createString("introduce");

    public final NumberPath<Long> userCode = createNumber("userCode", Long.class);

    public final StringPath userRole = createString("userRole");

    public QMainUserEntity(String variable) {
        super(MainUserEntity.class, forVariable(variable));
    }

    public QMainUserEntity(Path<? extends MainUserEntity> path) {
        super(path.getType(), path.getMetadata());
    }

    public QMainUserEntity(PathMetadata metadata) {
        super(MainUserEntity.class, metadata);
    }

}

