package com.website.publicfile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "public_file_comment")
@AllArgsConstructor
@NoArgsConstructor
@Getter@Setter
public class PublicFileCommentEntity {
    @Id
    @Column(name = "public_file_comment_code")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long publicFileCommentCode;
    @Column(name = "content")
    private String content;
    @Column(name = "create_at")
    private LocalDateTime createAt;
    @OneToOne
    @JoinColumn(name = "user_code")
    private PublicFileUserEntity user;
    @Column(name = "public_file_code")
    private Long fileCode;
//    @OneToMany
//    @JoinColumn(name = "comment_comment_code")
//    private List<PublicFileCommentEntity> comments;
    @Column(name = "comment_comment_code")
    private Long parentCommentCode;

    public PublicFileCommentEntity(String content, LocalDateTime createAt, PublicFileUserEntity user, Long fileCode) {
        this.content = content;
        this.createAt = createAt;
        this.user = user;
        this.fileCode = fileCode;
    }
}
