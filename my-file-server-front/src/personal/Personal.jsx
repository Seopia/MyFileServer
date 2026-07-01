import { useCallback, useEffect, useState } from 'react';
import api from '../common/api';
import s from './Personal.module.css';
import { deleteFile, getFileIconByExtension } from '../main/function';
import CustomModal from '../common/CustomModal';
import Filedetail from './components/FileDetail';
import { uploadChunk } from '../main/apiFunction';
import { useNavigate } from 'react-router-dom';
import { loginUrl } from '../common/url';
import UploadComponent from './components/upload/UploadComponent';
import ShowDatas from './components/ShowDatas';

function Personal() {
    const nav = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            nav(loginUrl);
        }
    }, [nav])
    const [history, setHistory] = useState([]);
    const [folderCode, setFolderCode] = useState(null);
    const [isShowFileDetail, setIsShowFileDetail] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [selectedMenuFolderCode, setSelectedMenuFolderCode] = useState(null);

    //지금 현재 화면에 렌더링하는 데이터 state
    const [files, setFiles] = useState(null);
    //뒤로가기를 위한 이전 데이터 저장 state

    //파일 업로드 관련 state
    const [uploadFolderCode, setUploadFolderCode] = useState(null);

    /**모달 관리 state*/
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);

    //파일 삭제
    const handleDeleteFormSubmit = useCallback(async (fileCode) => {
        await deleteFile(fileCode);
        setFiles((prev) => ({ ...prev, files: prev.files.filter(file => file.fileCode !== fileCode), }));
        setIsShowFileDetail(false);
    }, []);
    //폴더 이름 바꾸기 모달

    const handleRenameFormSubmit = useCallback(async (data) => {
        await api.post('/main/folder-name', { folderCode: selectedMenuFolderCode, description: data });
        setFiles((prevState) => ({
            ...prevState,
            folders: prevState.folders.map((folder) =>
                folder.folderCode === selectedMenuFolderCode
                    ? { ...folder, folderName: data }
                    : folder
            )
        }));
        setIsRenameFolderModalOpen(false);
    }, [selectedMenuFolderCode]);
    const closeRenameFolderModal = useCallback(() => setIsRenameFolderModalOpen(false), []);


    const handleCreateFolderModalSubmit = async (folderName) => {    //새 폴더 모달 제출 후
        const res = await api.post('/main/folder', { folderName: folderName, folderCode: folderCode });
        setFiles(prev => ({ ...prev, folders: [...prev.folders, res.data] }));
        setIsCreateFolderModalOpen(false);
    }


    //폴더안에 있는 폴더,파일을 가져오는 함수
    const getMyFileData = useCallback(async (folderCode) => {
        //만약 폴더 코드를 인자로 주지 않았다면?
        if (!folderCode) {
            //최상단 폴더 조회하기
            const { data } = await api.get('/main/root-folder');
            folderCode = data;
            setFolderCode(data.folderCode);
            setUploadFolderCode(data.folderCode);
        }
        //화면에 렌더링할 파일, 폴더 가져오기
        const myFiles = await api.get(`/main/folder?folderCode=${folderCode}`);
        setFolderCode(myFiles.data.folderCode);
        setFiles(myFiles.data);
        setUploadFolderCode(myFiles.data.folderCode);

    }, []);


    //폴더 내부로 들어갈 때 호출되는 함수
    const intoFolder = (folderCode) => {
        setHistory((prev) => [...prev, folderCode]);
        setIsShowFileDetail(false);
    }
    const back = () => {
        setIsMenuVisible(false);
        setIsShowFileDetail(false);
        setHistory((prev) => {
            if (prev.length === 0) {
                return prev;
            } else {
                return prev.slice(0, -1);
            }
        })
    }
    useEffect(() => {
        if (!localStorage.getItem('token')) return;
        if (history.length !== 0) {
            getMyFileData(history[history.length - 1]);
        } else {
            getMyFileData();
        }
    }, [history, getMyFileData])
    //파일 클릭했을 때 디테일 표시하게
    const showDetailOfFile = (file) => {
        setIsShowFileDetail(true);
        setSelectedFile(file);
    }

    const handleContextMenu = (event, folderCode) => {
        setSelectedMenuFolderCode(folderCode);
        event.preventDefault(); // 기본 브라우저 컨텍스트 메뉴를 비활성화
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setIsMenuVisible(true);
    };
    const deleteFolder = async () => {
        try {
            await api.delete(`/main/folder?folderCode=${selectedMenuFolderCode}`);
            setFiles((prev) => ({
                ...prev,
                folders: prev.folders.filter(folder => folder.folderCode !== selectedMenuFolderCode),
            }));
        } catch (e) {
            alert('안에 있는 폴더부터 삭제해주세요.');
        }

    }

    useEffect(() => {
        if (!localStorage.getItem('token')) return;
        getMyFileData();
    }, [getMyFileData]);

    /**업로드 관련*/
    const [uploadState, setUploadState] = useState({ select: false, loading: false, uploading: false, merging: false });
    const [uploadPercent, setUploadPercent] = useState(0);
    const [file, setFile] = useState({ file: null, name: '' });
    const upload = async () => {
        if (file.file.size > (100 * 1024 * 1024)) {  //100메가 이상이면

            uploadChunk(file.file, file.name, folderCode, setUploadPercent, setUploadState,
                (res) => {
                    setFiles(prev => ({ ...prev, files: [...prev.files, res] }));
                    setUploadPercent(0);
                    setUploadState({ select: false, loading: false, uploading: false, merging: false }); //무조건 로딩 시키고 끝내
                });
        } else {
            setUploadState({ select: true, loading: true, uploading: true, merging: false });
            const res = await api.post('/main/upload', { file: file.file, description: file.name, isPrivate: false, folderCode: uploadFolderCode }, {
                onUploadProgress: (e) => {
                    const p = Math.round((e.loaded * 100) / e.total);
                    setUploadPercent(p);
                }
            });
            setUploadState({ select: false, loading: false, uploading: false, merging: false });
            setFiles(prev => ({ ...prev, files: [...prev.files, res.data] }))
            setUploadPercent(0);
        }
    }
    useEffect(() => {
        if (file.file) {
            setUploadState(p => ({ ...p, select: true }));
        }
    }, [file])

    return (
        <>

            <div className={s.mainContainer} onClick={() => setIsMenuVisible(false)}>
                <div className={s.container}>
                    {/* Header Section */}
                    <div className={s.header}>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className={s.head}>
                                <div className={s.titleSection}>
                                    <h1 className={s.pageTitle}>
                                        <span className={s.titleIcon}>☁️</span>
                                        개인 클라우드
                                    </h1>
                                    <div className={s.subtitle}>
                                        <span className={s.lockIcon}>🔒</span>
                                        누구도 볼 수 없습니다. 원하는 파일만 링크로 공유하세요.
                                    </div>
                                </div>
                                <div className={s.actionButtons}>
                                    <button onClick={() => setIsCreateFolderModalOpen(true)} className={s.folderButton}>
                                        <span className={s.buttonIcon}>📁</span>새 폴더
                                    </button>
                                </div>
                            </div>
                            <UploadComponent uploadState={uploadState} uploadPercent={uploadPercent} setFile={setFile} upload={upload} file={file} setUploadState={setUploadState} />

                        </div>

                    </div>

                    <div className={s.divider}></div>
                    {history.length !== 0 && (
                        <button onClick={back} className={s.backButton}>
                            <span className={s.buttonIcon}>⬅️</span>
                            뒤로가기
                        </button>
                    )}
                    {/* Files and Folders Container */}
                    <div className={s.contentSection}>
                        {files && (files.folders.length > 0 || files.files.length > 0) ? (
                            <div className={s.allFilesContainer}>
                                {/* Folders Section */}
                                {files.folders.length > 0 && (
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

                                {/* Files Section */}
                                {files.files.length > 0 && (
                                    <div className={s.section}>
                                        <div className={s.sectionHeader}>
                                            <span className={s.sectionIcon}>📄</span>
                                            <h3 className={s.sectionTitle}>파일 ({files.files.length})</h3>
                                        </div>
                                        <div className={s.filesContainer}>
                                            {files.files.map((file) => (
                                                <ShowDatas
                                                    key={file.fileCode}
                                                    folder={null}
                                                    intoFolder={null}
                                                    file={file}
                                                    showDetailOfFile={showDetailOfFile}
                                                    setSelectedFile={setSelectedFile}
                                                    getFileIconByExtension={getFileIconByExtension}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={s.emptyCloudState}>
                                <div className={s.emptyCloudIcon}>☁️</div>
                                <h3 className={s.emptyCloudTitle}>클라우드가 비어있습니다</h3>
                                <p className={s.emptyCloudText}>파일을 업로드하거나 새 폴더를 만들어 시작해보세요.</p>
                                <div className={s.emptyCloudActions}>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Detail Modal */}
                {isShowFileDetail && (
                    <Filedetail
                        isShowFileDetail={isShowFileDetail}
                        setIsShowFileDetail={setIsShowFileDetail}
                        selectedFile={selectedFile}
                        handleDeleteFormSubmit={handleDeleteFormSubmit}
                    />
                )}

                {/* Context Menu */}
                {isMenuVisible && (
                    <div className={s.contextMenuOverlay}>
                        <div className={s.contextMenu} style={{ top: menuPosition.y, left: menuPosition.x }}>
                            <ul className={s.menuList}>
                                <li className={s.menuItem} onClick={deleteFolder}>
                                    <span className={s.menuIcon}>🗑️</span>
                                    삭제하기
                                </li>
                                <li className={s.menuItem} onClick={() => setIsRenameFolderModalOpen(true)}>
                                    <span className={s.menuIcon}>✏️</span>
                                    이름 변경하기
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            {isCreateFolderModalOpen && <CustomModal
                message="폴더 이름을 입력하세요."
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onSubmit={handleCreateFolderModalSubmit}
                isInput={true}
            />}
            {isRenameFolderModalOpen && <CustomModal
                message="변경할 폴더 이름을 입력하세요."
                isOpen={isRenameFolderModalOpen}
                onClose={closeRenameFolderModal}
                onSubmit={handleRenameFormSubmit}
                isInput={true}
            />}
        </>
    );
}

export default Personal;