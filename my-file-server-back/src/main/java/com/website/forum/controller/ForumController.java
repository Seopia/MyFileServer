package com.website.forum.controller;

import com.website.forum.dto.ForumDTO;
import com.website.forum.dto.ForumDetailDTO;
import com.website.forum.service.ForumService;
import com.website.security.dto.CustomUserDetails;
import com.website.security.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("")
public class ForumController {

    private final ForumService forumService;

    public ForumController(ForumService forumService) {
        this.forumService = forumService;
    }


    /* 게시글 조회 페이징 */
    @GetMapping("/forum")
    public ResponseEntity<Page<ForumDTO>> getForumList(@RequestParam int page){

        Pageable pageable = PageRequest.of(page, 10, Sort.by("createAt"));
        return ResponseEntity.ok().body(forumService.getForumList(pageable));
    }



    /* 게시글 상세 조회 */
    @GetMapping("/forum/{forumCode}")
    public ResponseEntity<ForumDetailDTO> getForumDetail(@PathVariable Long forumCode){

        return ResponseEntity.ok().body(forumService.getForumDetail(forumCode));

    }




    /* 게시글 등록 */
    @PostMapping("/forum")
    public ResponseEntity<?> registForum(@AuthenticationPrincipal CustomUserDetails user, @RequestBody ForumDTO forumDTO){

        return ResponseEntity.ok().body(forumService.registForum(user, forumDTO));
    }


    /* 게시글 삭제 */




}
