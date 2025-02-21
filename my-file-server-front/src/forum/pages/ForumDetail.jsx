import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import api from "../../common/api";
import { useCallback, useEffect, useState } from "react";
import s from "./ForumDetail.module.css"
import { useSelector } from "react-redux";
import DOMPurify from 'dompurify';
import MobileHeader from "../../main/Mobile/Component/MobileHeader";
import { truncateString } from "../../main/function";
import axios from "axios";


const ForumDetail = () => {

    
    const isMobile = useOutletContext();
    const { code } = useParams();
    const nav = useNavigate();


    const { data } = useSelector((state) => state.user);

    const [isSliding, setIsSliding] = useState(false);
    const location = useLocation(); // 현재 경로 추적
    const [isShowAttachment, setIsShowAttachment] = useState(false);
    const [forum, setForum] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({
        content: "",
        ip_address: ""
    });


    // 댓글 onInput 변화 감지 함수
    const handleTextarea = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;


        setNewComment((prev) => ({
            ...prev,
            content: e.target.value
        }));


    }

    const getForumDetail = useCallback(async () => {
        const res = await api.get(`/forum/${code}`);
        setForum(res.data);

    }, [code]);


    const deleteForum = async () => {
        try {
            if (window.confirm("정말 삭제하시겠습니까?")) {
                await api.delete(`/forum/${code}`);
                nav(`/forum`);
            }
        } catch (err) {
            console.log(err, "삭제 실패!!");

        }


    }


    const getCommentList = useCallback(async () => {
        const res = await api.get(`/comment/${code}?page=0`);
        setComments(res.data.content);
    }, [code])


    const registComment = async () => {
        if (newComment.content.trim() === '') {
            return;
        }
        try {
            await api.post(`/comment/${code}`, newComment);
            setNewComment({
                content: "",
                ip_address: ""
            });
        } catch (err) {
            console.log(err);
        }
        getCommentList();
    }


    const deleteComment = async (code) => {
        try {
            if (window.confirm("댓글을 삭제하시겠습니까?")) {
                await api.delete(`/comment/${code}`);
            }

        } catch (err) {
            console.log(err, "삭제 실패");

        }
        getCommentList();

    }


    useEffect(() => {
        if (code) {
            // countViews(); 조회수
            getForumDetail();
            getCommentList();

        }

    }, [code, getCommentList, getForumDetail])



    // 경로가 변할 때마다 애니메이션 상태 설정
    useEffect(() => {

        setIsSliding(false);  // 처음엔 슬라이딩이 되지 않도록 설정
        const timeoutId = setTimeout(() => {
            setIsSliding(true); // 0.1초 후에 슬라이딩 시작
        }, 100); // 애니메이션 시작을 100ms 후에 설정 (조정 가능)

        return () => clearTimeout(timeoutId); // 컴포넌트가 unmount될 때 타이머 정리


    }, [location]); // location이 바뀔 때마다 애니메이션 재시작




    // 날짜 포맷팅 함수
    const formattedDate = (createAt) => {

        const today = new Date();

        const formattedDate = `${createAt[0]}-${String(createAt[1]).padStart(2, '0')}-${String(createAt[2]).padStart(2, '0')}T${String(createAt[3]).padStart(2, '0')}:${String(createAt[4]).padStart(2, '0')}:${String(createAt[5]).padStart(2, '0')}`;
        const createDate = new Date(formattedDate);

        const diffMs = today - createDate;
        const diffInMinutes = Math.floor(diffMs / (1000 * 60));
        const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) return "방금 전";
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        if (diffInHours < 24) return `${diffInHours}시간 전`;
        if (diffInDays < 1) return `${diffInDays}일 전`;

        return `${createAt[0]}.${String(createAt[1]).padStart(2, '0')}.${String(createAt[2]).padStart(2, '0')} ${String(createAt[3]).padStart(2, '0')}:${String(createAt[4]).padStart(2, '0')}`;
    }



    // HTML 안전하게 렌더링
    const SafeHTMLComponent = (content) => {

        const cleanHTML = DOMPurify.sanitize(content);
        //위험이 없어진 HTML 태그를 렌더링 한다.
        return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
    }

    const download = (file) => {
        axios({
            url: file.fileFullPath,
            method: 'GET',
            responseType: 'blob',
            headers: {
                Authorization: localStorage.getItem("token")
            },
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', file.originalName); // 다운로드할 파일 이름 설정
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                window.open(file.fileFullPath, '_blank');
            })
    }

    return <div onClick={() => { isShowAttachment && setIsShowAttachment(false) }} className={`${s.forumDetail} ${isSliding ? `${s.sliding}` : ``}`}>
        {isMobile && <MobileHeader title='글 보기' />}
        <h2 className={s.pageTitle}>자유 게시판</h2>

        <div className={s.container}>
            <h2 className={s.title}>{forum.title}</h2>

            <div className={s.containerHeader}>
                <div>작성자 <b>{forum.userId}</b></div>
                <div style={{ display: "flex" }}>
                    {forum.createAt && formattedDate(forum.createAt)}
                    {forum?.userId === data?.id || data?.userRole === 'ROLE_ADMIN' ?
                        <div className={s.deleteBtn} onClick={() => deleteForum()}>
                            <img alt="delete" width={15} src="/deleteIcon.png" />
                        </div> : <></>
                    }
                    {forum.file?.length > 0 &&
                        <div className={s.attachmentContainer}>
                            <div style={{ cursor: 'pointer', userSelect: 'none'}} onClick={() => setIsShowAttachment(!isShowAttachment)}>첨부파일</div>
                            {
                                isShowAttachment &&
                                <article>
                                    {forum.file?.map((f) => (
                                        <div
                                            key={f.attachmentCode}
                                            className={s.file}
                                            onClick={() => download(f)}
                                        >
                                            <div>{truncateString(f.originalName, 10, true)}</div>
                                        </div>
                                    ))}
                                </article>
                            }
                        </div>
                    }
                </div>
            </div>

            <div className={s.containerContent}>
                <div className={s.content}>{forum.content && SafeHTMLComponent(forum.content)}</div>
            </div>

            <div className={s.containerFooter}>
                <div style={{ marginRight: "1em" }}>댓글 <b>{comments.length}</b></div>
                <div>조회수 <b>{forum?.views ? forum.views+1 : 0}</b></div>
            </div>


            {/* 댓글 리스트 */}
            <div className={s.containerComment}>

                <div className={s.containerWrite}>
                    <textarea rows="2" placeholder="댓글 작성"
                        name="content"
                        onInput={handleTextarea}
                        value={newComment.content}
                    />
                    <button onClick={() => registComment()}>확인</button>
                </div>


                {comments.map((comment, idx) => (
                    <div className={s.comment} key={idx}>
                        <div className={s.commentHeader}>
                            <div style={comment.user.id === '관리자' ? { color: 'red' } : {}}>{comment.user.id}</div>
                            <div style={{ marginLeft: "0.5em", marginRight: "0.5em" }}>•</div>
                            <div className={s.commentDate}> {comment.createAt && formattedDate(comment.createAt)}</div>

                            {comment?.user?.userCode === data?.userCode || data?.userRole === 'ROLE_ADMIN' ?
                                <div className={s.deleteBtn} onClick={() => deleteComment(comment.commentCode)}>
                                    <img alt="delete" width={15} src="/deleteIcon.png" />
                                </div> : <></>
                            }
                        </div>
                        <div className={s.commentContent}>{comment.content}</div>

                    </div>
                ))}

            </div>
        </div>


    </div>

}

export default ForumDetail;