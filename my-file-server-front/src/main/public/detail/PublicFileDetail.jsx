import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteCommentPublicFile, deletePublicFile, downloadPublicFile, getCommentPublicFile, getFileByFileCode, recommendPublicFile, writeCommentPublicFile, writeLog } from "../apiFunction";
import { useState } from "react";
import { calcFileSize, formattedDateTime, prettyCategory, truncateString } from "../../function";
import s from './PublicFileDetail.module.css';
import DOMPurify from 'dompurify';
import { useSelector } from "react-redux";
import CustomModal from "../../../common/CustomModal";
import { loginUrl } from "../../../common/url";
import { FileMinus, FileX, Trash2 } from "lucide-react";


const PublicFileDetail = () => {
    const { fileCode } = useParams();
    const nav = useNavigate();
    const { data } = useSelector((state) => state.user);
    const [modalState, setModalState] = useState({
        deleteModal: false,
    })


    const [file, setFile] = useState({ category: '', changedName: '', description: '', downloadCount: 0, fileCode: fileCode, fileFullPath: '', originalName: '', size: '', title: '', uploadedAt: [], user: { userCode: 0, id: '' }, recommendCount: 0 });
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const isOwner = data?.userCode === file.user.userCode;
    const isAdult = file.category === "porn"
    const getFile = async () => {
        getFileByFileCode(fileCode, (res) => {
            setFile(res);
        });
    }
    const recommend = () => {
        recommendPublicFile(fileCode, () => {
            setFile((p) => ({ ...p, recommendCount: file.recommendCount + 1 }));
        })
    }
    const deleteFile = () => {
        deletePublicFile(file.fileCode, () => {
            nav(-1);
        });
    }
    const download = () => {
        writeLog(file.fileCode);
        setFile(p => ({ ...p, downloadCount: file.downloadCount + 1 }));
        downloadPublicFile(file);
    }
    const SafeHTMLComponent = (content) => {
        const cleanHTML = DOMPurify.sanitize(content);
        return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
    }
    const getComment = async () => getCommentPublicFile(fileCode, res => setComments(res));
    const writeComment = () => {
        writeCommentPublicFile(fileCode, commentInput, (res) => { setComments((p) => ([res, ...p])); setCommentInput('') });
    }
    const deleteComment = (comment) => {
        deleteCommentPublicFile(comment, (res) => {
            setComments(prev => prev.filter(i => i.publicFileCommentCode !== comment.publicFileCommentCode));
        });

    }
    useEffect(() => { getComment() }, []);
    useEffect(() => { getFile(); }, []);
    useEffect(() => {
        console.log(comments);

    }, [comments])
    return (
        <div className={s.pageContainer}>
            <div className={s.contentContainer}>
                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.headerTop}>
                            <div className={s.titleContainer}>
                                <h1 className={s.title}>{file.title}</h1>
                                <div className={s.recommendStatus}>
                                    {file.recommendCount === 0 ? (
                                        <div className={s.recommendEmpty}>
                                            <span className={s.heartIcon}>♥</span>
                                            <span>이 파일이 마음에 든다면 {!data&&'로그인 후'} 추천 버튼을 눌러주세요</span>
                                        </div>
                                    ) : (
                                        <div className={s.recommendFilled}>
                                            <span className={s.heartIcon}>♥</span>
                                            <span>{file.recommendCount}명이 추천한 파일이에요</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isOwner && (
                                <button onClick={() => setModalState((p) => ({ ...p, deleteModal: true }))} className={s.deleteButton}>
                                    <FileX/>
                                    삭제하기
                                </button>
                            )}
                        </div>

                        <div className={s.uploadInfo}>
                            <div className={s.infoItem}>
                                <span className={s.calendarIcon}>📅</span>
                                <span>{`${file.uploadedAt[0]}년 ${file.uploadedAt[1]}월 ${file.uploadedAt[2]}일 ${file.uploadedAt[3]}시 업로드`}</span>
                            </div>
                            <div className={s.infoItem}>
                                <span className={s.userIcon}>👤</span>
                                <span>업로드: {file.user.id}</span>
                            </div>
                        </div>

                        <div className={s.infoGrid}>
                            <div className={s.infoColumn}>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>파일 이름: {truncateString(file.originalName,15, true)}</span>
                                </div>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>용량: {calcFileSize(file.size)}</span>
                                </div>
                            </div>

                            <div className={s.infoColumn}>
                                <div className={s.infoRow}>
                                    <div className={s.categoryDot} style={{ backgroundColor: isAdult ? "#ff5555" : "#7965c1" }}></div>
                                    <div>
                                        <span className={s.infoLabel}>카테고리:</span>
                                        <span className={isAdult ? s.adultCategory : s.normalCategory}>
                                            {prettyCategory(file.category)}
                                        </span>
                                    </div>
                                </div>
                                <div className={s.infoRow}>
                                    <div>
                                        <span className={s.infoLabel}>다운로드 : {file.downloadCount.toLocaleString()}회</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={s.buttonBox}>
                            <button onClick={download} className={s.primaryButton}>
                                <span className={s.buttonIcon}>⬇️</span>
                                다운로드
                            </button>
                            { data&&
                                <button onClick={recommend} className={s.secondaryButton}>
                                    <span className={s.buttonIcon}>♥</span>
                                    추천하기
                                </button>
                            }
                        </div>
                    </div>
                </div>

                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <h2 className={s.sectionTitle}>파일 설명</h2>
                    </div>
                    <div className={s.cardContent}>
                        <div className={s.description}>{SafeHTMLComponent(file.description)}</div>
                    </div>
                </div>

                <div className={s.card}>
                    <div className={s.cardHeader}>
                        <div className={s.sectionTitleContainer}>
                            <span className={s.commentIcon}>💬</span>
                            <h2 className={s.sectionTitle}>댓글 ({comments.length})</h2>
                        </div>
                    </div>
                    <div className={s.cardContent}>
                        {data ?
                            <div className={s.commentWriteContainer}>
                                <input
                                    type="text"
                                    placeholder="감사 인사를 남겨보세요."
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    className={s.commentInput}
                                />
                                <button onClick={writeComment} className={s.primaryButton}>
                                    <span className={s.buttonIcon}>📤</span>
                                    작성
                                </button>
                            </div> :
                            <div><span onClick={()=>nav(loginUrl)} style={{textDecoration:'underline', cursor:'pointer', color:'rgb(126, 195, 255)'}}>로그인</span> 하고 댓글을 남겨보세요.</div>
                        }

                        <div className={s.hr}></div>

                        <div className={s.commentContainer}>
                            {comments.length === 0 ? (
                                <div className={s.emptyComments}>
                                    <span className={s.bigCommentIcon}>💬</span>
                                    <p>아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.publicFileCommentCode} className={s.comment}>
                                        <div className={s.commentAvatar}>{comment.user.id.charAt(0).toUpperCase()}</div>
                                        <div className={s.commentBody}>
                                            <div className={s.commentHeader}>
                                                <h4 className={s.commentId}>{comment.user.id}</h4>
                                                <div className={s.commentActions}>
                                                    <span className={s.commentDate}>{formattedDateTime(comment.createAt)}</span>
                                                    {data?.userCode === comment.user.userCode && (
                                                        <button onClick={() => deleteComment(comment)} className={s.commentDeleteButton}>
                                                            <Trash2 size={20}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={s.commentContent}>{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {
                modalState.deleteModal &&
                <CustomModal
                    message="삭제하시겠습니까?"
                    isOpen={modalState.deleteModal}
                    onClose={() => setModalState(p => ({ ...p, deleteModal: false }))}
                    onSubmit={deleteFile} />
            }
        </div>

    )
}

export default PublicFileDetail;