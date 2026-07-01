import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomModal from '../../common/CustomModal';
import api from '../../common/api';
import s from './Group.module.css';
import Filedetail from '../../personal/components/FileDetail';
import ShowDatas from '../../personal/components/ShowDatas';
import UploadComponent from '../../personal/components/upload/UploadComponent';
import { getFileIconByExtension } from '../../main/function';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { loginUrl } from '../../common/url';
import {
    groupDeleteGroup,
    groupDeleteFile,
    groupDeleteFolder,
    groupGetThisGroup,
    groupUploadChunk,
    groupUploadFile,
    groupKickMember,
} from '../apiGroupFunction';
import { useSelector } from 'react-redux';

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB

function Group() {
    const { code } = useParams();
    const isMobile = useOutletContext();
    const [history, setHistory] = useState([]);
    const nav = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            nav(loginUrl);
        }
    }, [nav]);
    const { data: userData } = useSelector((state) => state.user);

    const [folderCode, setFolderCode] = useState(null);
    const [uploadFolderCode, setUploadFolderCode] = useState(null);
    const [files, setFiles] = useState(null);
    const [group, setGroup] = useState({});
    const [members, setMembers] = useState([]);
    const [showGroupMember, setShowGroupMember] = useState(false);

    // 파일 선택/상세
    const [isShowFileDetail, setIsShowFileDetail] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // 컨텍스트 메뉴
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [selectedMenuFolderCode, setSelectedMenuFolderCode] = useState(null);

    // 업로드 상태 — UploadComponent와 동일한 패턴
    const [uploadState, setUploadState] = useState({ select: false, loading: false, uploading: false, merging: false });
    const [uploadPercent, setUploadPercent] = useState(0);
    const [uploadFile, setUploadFile] = useState({ file: null, name: '' });

    // 모달
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
    const [isGroupDeleteModalOpen, setIsGroupDeleteModalOpen] = useState(false);
    const [deleteFileCode, setDeleteFileCode] = useState(null);

    /* ──────────────── 데이터 로딩 ──────────────── */
    const getMyFileData = useCallback(async (fc) => {
        try {
            let currentFolderCode = fc;
            if (!currentFolderCode) {
                const { data } = await api.get(`/group-root-folder?groupCode=${code}`);
                currentFolderCode = data;
                setFolderCode(data);
                setUploadFolderCode(data);
            }
            if (!currentFolderCode || currentFolderCode === 'null') {
                return;
            }
            const res = await api.get(`/group/file?folderCode=${currentFolderCode}&groupCode=${code}`);
            setFolderCode(res.data.folderCode);
            setFiles(res.data);
            setUploadFolderCode(res.data.folderCode);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    alert('존재하지 않는 그룹입니다.');
                    nav('/group/select');
                } else if (error.response.status === 403) {
                    alert('해당 그룹의 멤버가 아닙니다.');
                    nav('/group/select');
                } else {
                    console.error(error);
                }
            } else {
                console.error(error);
            }
        }
    }, [code, nav]);

    useEffect(() => {
        if (history.length !== 0) {
            getMyFileData(history[history.length - 1]);
        } else {
            getMyFileData();
        }
    }, [history, getMyFileData]);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                await groupGetThisGroup(code, (r) => setGroup(r));
            } catch (error) {
                console.error(error);
            }
        };
        fetchGroup();
    }, [code]);

    const getGroupMembers = useCallback(async () => {
        try {
            const res = await api.get(`/group/member?groupCode=${code}`);
            setMembers(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [code]);

    useEffect(() => { getGroupMembers(); }, [getGroupMembers]);

    /* ──────────────── 네비게이션 ──────────────── */
    const intoFolder = (fc) => { setHistory((p) => [...p, fc]); setIsShowFileDetail(false); };
    const back = () => {
        setIsMenuVisible(false);
        setIsShowFileDetail(false);
        setHistory((p) => (p.length === 0 ? p : p.slice(0, -1)));
    };

    /* ──────────────── 업로드 ──────────────── */
    const upload = async () => {
        if (!uploadFile.file) return;

        if (uploadFile.file.size > LARGE_FILE_THRESHOLD) {
            // 대용량 → 청크 업로드
            setUploadState({ select: true, loading: true, uploading: true, merging: false });
            groupUploadChunk(
                uploadFile.file,
                uploadFile.name,
                uploadFolderCode,
                code,
                (res) => {
                    setFiles((prev) => ({ ...prev, files: [...prev.files, res] }));
                    setUploadPercent(0);
                    setUploadState({ select: false, loading: false, uploading: false, merging: false });
                    setUploadFile({ file: null, name: '' });
                },
                (p) => setUploadPercent(p),
                setUploadState
            );
        } else {
            // 소형 → 단건 업로드
            setUploadState({ select: true, loading: true, uploading: true, merging: false });
            const res = await groupUploadFile(uploadFile.file, uploadFile.name, uploadFolderCode, (p) => setUploadPercent(p));
            setFiles((prev) => ({ ...prev, files: [...prev.files, res] }));
            setUploadPercent(0);
            setUploadState({ select: false, loading: false, uploading: false, merging: false });
            setUploadFile({ file: null, name: '' });
        }
    };

    useEffect(() => {
        if (uploadFile.file) {
            setUploadState((p) => ({ ...p, select: true }));
        }
    }, [uploadFile]);

    /* ──────────────── 삭제 ──────────────── */
    const handleDeleteFile = useCallback(async (fileCode) => {
        await groupDeleteFile(fileCode);
        setFiles((prev) => ({ ...prev, files: prev.files.filter((f) => f.fileCode !== fileCode) }));
        setIsShowFileDetail(false);
    }, []);

    const deleteFolder = async () => {
        try {
            await groupDeleteFolder(selectedMenuFolderCode);
            setFiles((prev) => ({
                ...prev,
                folders: prev.folders.filter((f) => f.folderCode !== selectedMenuFolderCode),
            }));
        } catch {
            alert('폴더 삭제에 실패했습니다. 안에 있는 폴더부터 삭제해주세요.');
        }
        setIsMenuVisible(false);
    };

    const deleteGroup = async (text) => {
        if (text === '삭제한다') {
            groupDeleteGroup(code, (r) => { r ? nav('/group/select') : alert('그룹 삭제에 실패했습니다.'); });
        }
        setIsGroupDeleteModalOpen(false);
    };

    const handleKickMember = async (member) => {
        if (window.confirm(`${member.id} 님을 정말 그룹에서 추방하시겠습니까?`)) {
            try {
                await groupKickMember(code, member.userCode);
                alert('추방이 완료되었습니다.');
                getGroupMembers();
            } catch (error) {
                alert('멤버 추방에 실패했습니다.');
            }
        }
    };

    /* ──────────────── 폴더 생성 / 이름변경 ──────────────── */
    const handleCreateFolder = async (folderName) => {
        const res = await api.post('/group/folder', { groupCode: code, folderName, folderCode });
        setFiles((prev) => ({ ...prev, folders: [...prev.folders, res.data] }));
        setIsCreateFolderModalOpen(false);
    };

    const handleRenameFolder = useCallback(async (newName) => {
        await api.post('/main/folder-name', { folderCode: selectedMenuFolderCode, description: newName });
        setFiles((prev) => ({
            ...prev,
            folders: prev.folders.map((f) =>
                f.folderCode === selectedMenuFolderCode ? { ...f, folderName: newName } : f
            ),
        }));
        setIsRenameFolderModalOpen(false);
    }, [selectedMenuFolderCode]);

    /* ──────────────── 컨텍스트 메뉴 ──────────────── */
    const handleContextMenu = (event, fc) => {
        setSelectedMenuFolderCode(fc);
        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setIsMenuVisible(true);
    };

    const showDetailOfFile = (f) => { setIsShowFileDetail(true); setSelectedFile(f); };
    const isManager = group.manager === userData?.userCode;

    const isEmpty = files && files.folders.length === 0 && files.files.length === 0;

    return (
        <>
            {/* ── 멤버 사이드바 ── */}
            <AnimatePresence>
                {showGroupMember && (
                    <motion.div
                        className={s.memberSidebar}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={s.memberSidebarHeader}>
                            <h3 className={s.memberSidebarTitle}>👥 그룹 멤버</h3>
                            <button className={s.closeSidebarBtn} onClick={() => setShowGroupMember(false)}>✕</button>
                        </div>
                        <p className={s.memberSidebarSub}>닉네임을 클릭하면 소개 페이지로 이동합니다.</p>
                        <div className={s.memberList}>
                            {members.map((member) => (
                                <div key={member.userCode} className={s.memberItem}>
                                    <div className={s.memberAvatar}>{member.id?.[0]?.toUpperCase()}</div>
                                    <span
                                        className={s.memberId}
                                        onClick={() => nav(`/user/${member.userCode}`)}
                                    >
                                        {member.id}
                                    </span>
                                    {isManager && member.userCode !== userData?.userCode && (
                                        <button className={s.kickBtn} onClick={() => handleKickMember(member)}>추방</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 멤버 플로팅 버튼 ── */}
            {!showGroupMember && (
                <button className={s.memberFab} onClick={() => setShowGroupMember(true)}>
                    <span className={s.memberFabIcon}>👥</span>
                    <span className={s.memberFabLabel}>Members</span>
                </button>
            )}

            <div className={s.mainContainer} onClick={() => setIsMenuVisible(false)}>
                <div className={s.container}>

                    {/* ── 헤더 ── */}
                    <div className={s.header}>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className={s.head}>
                                <div className={s.titleSection}>
                                    <h1 className={s.pageTitle}>
                                        <span className={s.titleIcon}>🏠</span>
                                        {group.name || '그룹 클라우드'}
                                    </h1>
                                    <div className={s.subtitle}>
                                        <span className={s.groupIcon}>👥</span>
                                        {group.description || '그룹 설명이 없습니다.'}
                                    </div>
                                </div>
                                <div className={s.actionButtons}>
                                    <button onClick={() => setIsCreateFolderModalOpen(true)} className={s.folderButton}>
                                        <span className={s.buttonIcon}>📁</span>새 폴더
                                    </button>
                                    {isManager && (
                                        <>
                                            <button onClick={() => nav(`/group/management/${code}`)} className={s.manageButton}>
                                                <span className={s.buttonIcon}>⚙️</span>관리
                                            </button>
                                            <button onClick={() => setIsGroupDeleteModalOpen(true)} className={s.deleteButton}>
                                                <span className={s.buttonIcon}>🗑️</span>삭제
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 업로드 컴포넌트 */}
                            <UploadComponent
                                uploadState={uploadState}
                                uploadPercent={uploadPercent}
                                setFile={setUploadFile}
                                upload={upload}
                                file={uploadFile}
                                setUploadState={setUploadState}
                            />
                        </div>
                    </div>

                    <div className={s.divider} />

                    {/* 뒤로가기 */}
                    {history.length > 0 && (
                        <button onClick={back} className={s.backButton}>
                            <span className={s.buttonIcon}>⬅️</span>뒤로가기
                        </button>
                    )}

                    {/* ── 파일/폴더 목록 ── */}
                    <div className={s.contentSection}>
                        {isEmpty ? (
                            <div className={s.emptyCloudState}>
                                <div className={s.emptyCloudIcon}>☁️</div>
                                <h3 className={s.emptyCloudTitle}>그룹 클라우드가 비어있습니다</h3>
                                <p className={s.emptyCloudText}>파일을 업로드하거나 새 폴더를 만들어 시작해보세요.</p>
                            </div>
                        ) : (
                            <div className={s.allFilesContainer}>
                                {files && files.folders.length > 0 && (
                                    <div className={s.section}>
                                        <div className={s.sectionHeader}>
                                            <span className={s.sectionIcon}>📁</span>
                                            <h3 className={s.sectionTitle}>폴더 ({files.folders.length})</h3>
                                        </div>
                                        <div className={s.foldersContainer}>
                                            {files.folders.map((folder) => (
                                                <ShowDatas
                                                    key={folder.folderCode}
                                                    folder={folder}
                                                    intoFolder={intoFolder}
                                                    file={null}
                                                    handleContextMenu={handleContextMenu}
                                                    getFileIconByExtension={getFileIconByExtension}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {files && files.files.length > 0 && (
                                    <div className={s.section}>
                                        <div className={s.sectionHeader}>
                                            <span className={s.sectionIcon}>📄</span>
                                            <h3 className={s.sectionTitle}>파일 ({files.files.length})</h3>
                                        </div>
                                        <div className={s.filesContainer}>
                                            {files.files.map((f) => (
                                                <ShowDatas
                                                    key={f.fileCode}
                                                    folder={null}
                                                    intoFolder={null}
                                                    file={f}
                                                    showDetailOfFile={showDetailOfFile}
                                                    setSelectedFile={setSelectedFile}
                                                    getFileIconByExtension={getFileIconByExtension}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 파일 상세 ── */}
                {isShowFileDetail && (
                    <Filedetail
                        isShowFileDetail={isShowFileDetail}
                        setIsShowFileDetail={setIsShowFileDetail}
                        selectedFile={selectedFile}
                        handleDeleteFormSubmit={handleDeleteFile}
                    />
                )}

                {/* ── 우클릭 컨텍스트 메뉴 ── */}
                {isMenuVisible && (
                    <div className={s.contextMenuOverlay}>
                        <div className={s.contextMenu} style={{ top: menuPosition.y, left: menuPosition.x }}>
                            <ul className={s.menuList}>
                                <li className={s.menuItem} onClick={deleteFolder}>
                                    <span className={s.menuIcon}>🗑️</span>삭제하기
                                </li>
                                <li className={s.menuItem} onClick={() => { setIsMenuVisible(false); setIsRenameFolderModalOpen(true); }}>
                                    <span className={s.menuIcon}>✏️</span>이름 변경하기
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* ── 모달들 ── */}
            {isCreateFolderModalOpen && (
                <CustomModal
                    message="폴더 이름을 입력하세요."
                    isOpen={isCreateFolderModalOpen}
                    onClose={() => setIsCreateFolderModalOpen(false)}
                    onSubmit={handleCreateFolder}
                    isInput={true}
                />
            )}
            {isRenameFolderModalOpen && (
                <CustomModal
                    message="변경할 폴더 이름을 입력하세요."
                    isOpen={isRenameFolderModalOpen}
                    onClose={() => setIsRenameFolderModalOpen(false)}
                    onSubmit={handleRenameFolder}
                    isInput={true}
                />
            )}
            {isGroupDeleteModalOpen && (
                <CustomModal
                    message={"이 그룹을 제거하려면 '삭제한다'를 입력해주세요."}
                    isOpen={isGroupDeleteModalOpen}
                    onClose={() => setIsGroupDeleteModalOpen(false)}
                    onSubmit={deleteGroup}
                    submitMessage="제거하기"
                    closeMessage="취소"
                    placeholder="삭제한다"
                    isInput={true}
                />
            )}
        </>
    );
}

export default Group;