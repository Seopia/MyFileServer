import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../common/api";
import s from './PublicUpload.module.css';
import { truncateString } from "../../function";
import QuillEditor from "../../../common/QuillEditor";
import { useEffect } from "react";
import { uploadEarly, uploadEarlyWithSmallFile } from "../apiFunction";
import { useSelector } from "react-redux";

const PublicUpload = () => {
    const nav = useNavigate();
    const [msg, setMsg] = useState(false);
    const {data} = useSelector((state)=>state.user);

    const [uploadFiles, setUploadFiles] = useState({});
    const [uploadState, setUploadState] = useState({ loading: false, uploadLoading: false, mergeLoading: false, uploadPercent: 0, complete: false });
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [category, setCategory] = useState('');

    const [newPublicFilePost, setNewPublicFilePost] = useState({
        title: "",
        content: "",
        files: {},
    })


    const registForum = async () => {
        if (uploadedFileName && uploadState.complete) {
            const ob = {
                changedName: uploadedFileName,
                originalName: uploadFiles.name,
                size: uploadFiles.size,
                title: newPublicFilePost.title,
                category: category,
                description: newPublicFilePost.content,
            }
            if (newPublicFilePost.title.trim() !== '' && newPublicFilePost.content.trim() !== '' && category !== '') {
                const res = await api.post(`/public`, ob);
                if (res.data) {
                    
                    if(newPublicFilePost.isPrivate){
                        nav(`/user/${data.userCode}`)
                    } else {
                        nav(-1);
                    }
                } else {
                    alert('Error 발생! 콘솔 확인');
                    console.log(res);
                }
            } else {
                alert('제목, 카테고리, 내용을 작성해야합니다.');
            }
        } else {
            alert('파일 업로드를 먼저 진행해주세요!')
        }
    }
    const earlyUpload = () => {
        setUploadState(p => ({ ...p, loading: true })); //로딩 true
        if (uploadFiles.size < 10 * 1024 * 1024) {
            uploadEarlyWithSmallFile(uploadFiles, (res) => {
                setUploadState({ loading: true, uploadLoading: true, mergeLoading: true, uploadPercent: 100, complete: true });
                setUploadedFileName(res);
            });
        } else {
            uploadEarly(uploadFiles,
                (percent) => {
                    setUploadState(p => ({ ...p, uploadLoading: true, uploadPercent: percent }));  //percent 세팅, 업로드 중 true
                }, () => {
                    setUploadState(p => ({ ...p, mergeLoading: true }));  //머지 중
                }, (res) => {
                    setUploadState(p => ({ ...p, complete: true })); //완료
                    setUploadedFileName(res);   //바뀐 파일 이름
                });
        }
    }
    useEffect(() => {
        if (uploadFiles.name) {
            earlyUpload()
        }
    }, [uploadFiles])
    const handleTitleChange = (e) => {
        if (e.target.value.length <= 50) {
            setNewPublicFilePost((p) => ({ ...p, title: e.target.value }))
            setMsg(false)
        } else {
            setMsg(true)
        }
    }

    const handleFileChange = (e) => {
        setUploadFiles(e.target.files[0])
    }

    const removeFile = () => {
        setUploadFiles({})
    }
    const renderUploadStatus = () => {
        if (!uploadState.loading) {
            return (
                <button
                    className={s.fileEarlyUploadButton}
                    onClick={earlyUpload}
                    title="파일을 미리 업로드 하면서 아래 글을 작성해보세요! 이 버튼을 눌러도 클라우드에 파일이 올라가진 않아요!"
                >
                    <span className={s.uploadIcon}>⚡</span>
                    파일만 먼저 미리 업로드 하기
                </button>
            )
        }

        if (uploadState.loading && uploadState.uploadPercent === 0) {
            return (
                <div className={s.loading}>
                    <span className={s.loadingText}>업로드 준비 중...</span>
                    <div className={s.spinner}></div>
                </div>
            )
        }

        if (uploadState.uploadPercent !== 0 && !uploadState.mergeLoading) {
            return (
                <div className={s.loading}>
                    <span className={s.loadingText}>{uploadState.uploadPercent}%</span>
                    <div className={s.progressBar}>
                        <div className={s.progressFill} style={{ width: `${uploadState.uploadPercent}%` }}></div>
                    </div>
                </div>
            )
        }

        if (uploadState.mergeLoading && !uploadState.complete) {
            return (
                <div className={s.loading}>
                    <span className={s.loadingText}>거의 다 되었어요</span>
                    <div className={s.pulseLoader}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            )
        }

        if (uploadState.complete) {
            return (
                <div className={s.successMessage}>
                    <span className={s.successIcon}>✅</span>
                    업로드 성공!
                </div>
            )
        }
    }

    return (
        <div className={s.forumCreate}>
            <div className={s.container}>
                {/* Header */}
                <div className={s.header}>
                    <h2 className={s.pageTitle}>
                        <span className={s.titleIcon}>📤</span>
                        공용 파일 업로드
                    </h2>
                    <button className={s.submitBtn} onClick={registForum}>
                        <span className={s.buttonIcon}>🚀</span>
                        업로드 하기
                    </button>
                </div>

                {/* Title Section */}
                <div className={s.section}>
                    <div className={s.sectionHeader}>
                        <span className={s.sectionIcon}>📝</span>
                        <div className={s.itemTitle}>제목</div>
                    </div>
                    <input
                        name="title"
                        placeholder="제목을 입력하세요."
                        value={newPublicFilePost.title}
                        onChange={handleTitleChange}
                        className={s.titleInput}
                    />
                    <div className={s.letterLength}>
                        {msg ? (
                            <div className={s.errorMessage}>
                                <span className={s.errorIcon}>⚠️</span>
                                제목은 50자까지 작성할 수 있어요!
                            </div>
                        ) : (
                            <div></div>
                        )}
                        <div className={s.charCount}>
                            <span className={newPublicFilePost.title.length > 40 ? s.charCountWarning : s.charCountNormal}>
                                {newPublicFilePost.title.length}
                            </span>
                            / 50
                        </div>
                    </div>
                </div>

                {/* File Upload Section */}
                <div className={s.section}>
                    <div className={s.sectionHeader}>
                        <span className={s.sectionIcon}>📁</span>
                        <div className={s.itemTitle}>파일을 업로드 하세요.</div>
                    </div>

                    {/* File Upload Area */}
                    {!uploadFiles.name ? (
                        <div className={s.uploadArea}>
                            <label className={s.fileUploadBtn} htmlFor="uploadInput">
                                <span className={s.uploadBtnIcon}>📎</span>
                                파일 업로드
                                <div className={s.uploadHint}>클릭하여 파일을 선택하세요</div>
                            </label>
                            <input className={s.uploadInput} type="file" id="uploadInput" name="files" onChange={handleFileChange} />
                        </div>
                    ) : null}

                    {/* Category Select */}
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={s.categorySelect}>
                        <option disabled value="">
                            카테고리를 선택해주세요.
                        </option>
                        <option value="game">🎮 게임</option>
                        <option value="software">💻 소프트웨어</option>
                        <option value="music">🎵 음악</option>
                        <option value="movie">🎬 영화</option>
                        <option value="drama">📺 드라마</option>
                        <option value="tv">📻 TV 프로그램</option>
                        <option value="porn">🔞 성인</option>
                        <option value="none">📦 기타</option>
                    </select>

                    {/* File Display */}
                    {uploadFiles?.name && (
                        <div className={s.fileContainer}>
                            <div className={s.fileHeader}>
                                <span className={s.fileIcon}>📄</span>
                                <span className={s.fileText}>업로드된 파일</span>
                            </div>
                            <div className={s.fileItem}>
                                <div className={s.fileInfo}>
                                    <div className={s.fileName} title={uploadFiles.name}>
                                        {truncateString(uploadFiles.name, 30, true)}
                                    </div>
                                    <div className={s.fileSize}>
                                        {uploadFiles.size ? `${Math.round(uploadFiles.size / 1024)} KB` : ""}
                                    </div>
                                </div>
                                <button className={s.deleteBtn} onClick={removeFile}>
                                    <img src="/deleteIcon.png" alt="삭제" width={20} />
                                </button>
                            </div>

                            {/* Upload Status */}
                            <div className={s.uploadStatus}>{renderUploadStatus()}</div>
                        </div>
                    )}
                </div>

                {/* Description Section */}
                <div className={s.editorSection}>
                    <div className={s.sectionHeader}>
                        <span className={s.sectionIcon}>✍️</span>
                        <div className={s.explain}>파일의 설명을 작성해주세요!</div>
                    </div>
                    <div className={s.editorContainer}>
                        <QuillEditor
                            newForum={newPublicFilePost}
                            setNewForum={setNewPublicFilePost}
                            placeholder="파일에 대한 설명 등 사용법을 자유롭게 작성해주세요. 사진은 드래그해서 넣을 수 있어요"
                            publicFile={true}
                        />
                    </div>
                    <button className={s.submitBottomBtn} onClick={registForum}>
                        <span className={s.buttonIcon}>🚀</span>
                        업로드 하기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PublicUpload;