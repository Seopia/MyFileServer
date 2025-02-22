import React, { useCallback, useEffect, useState } from 'react';
import api from '../../common/api';
import ShowDatas from './ShowDatas';
import s from './PCMainUpdate.module.css';
import { deleteFile } from '../function';
import CustomModal from '../../common/CustomModal';
import Filedetail from './Components/FileDetail/FileDetail';
import { uploadChunk } from '../apiFunction';

export function PCMainUpdate() {
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
    const [file, setFile] = useState(null);
    const [deleteFileCode, setDeleteFileCode] = useState(0);
    const [uploadFolderCode, setUploadFolderCode] = useState(null);
        const [loading, setLoading] = useState({uploadPrepare:false, uploading: false});
        const [bigFilePercent, setBigFilePercent] = useState(0);
    
    /**모달 관리 state*/
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [isDeleteModal, setIsDeleteModal] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
    // const [modalOpenStatus, setModalOpenStatus] = useState({isUploadModalOpen: false, isDeleteModalOpen: false, isCreateFolderModalOpen: false, isRenameFolderModalOpen: false, isGroupDeleteModalOpen: false,});
    
    //파일 업로드 모달
    const handleFormSubmit = useCallback(async (fileName) => {
        
        setLoading((p)=>({...p, uploadPrepare: true})); //업로드 준비 시작

        if(file.size>(100 * 1024 * 1024)){

            uploadChunk(file, fileName, folderCode, (res)=>{
                setFiles(prev => ({ ...prev, files: [...prev.files, res] }));
                setBigFilePercent(0);
                setLoading((p)=>({...p, uploadPrepare: false, uploading: false})); //무조건 로딩 시키고 끝내
                setIsModalOpen(false);
            },setBigFilePercent,setLoading);
        } else {
            setLoading((p)=>({...p, uploading: true}));
            const res = await api.post('/main/upload', { file: file, description: fileName, isPrivate: false, folderCode: uploadFolderCode }, {
            onUploadProgress: (e) => {
                const p = Math.round((e.loaded * 100) / e.total);
                setBigFilePercent(p);
            }
            });
            setLoading((p)=>({...p, uploadPrepare: false, uploading: false})); //무조건 로딩 시키고 끝내
            setFiles(prev => ({ ...prev, files: [...prev.files, res.data] }))
            setIsModalOpen(false); 
            setBigFilePercent(0);
        }
        
    },[file,uploadFolderCode,folderCode]);

    
    const closeModal = useCallback(()=>setIsModalOpen(false),[]);
    //삭제 모달
    const handleDeleteFormSubmit = useCallback(async () => {
        await deleteFile(deleteFileCode);
        setFiles((prev) => ({ ...prev, files: prev.files.filter(file => file.fileCode !== deleteFileCode), }));
        setIsDeleteModal(false);
        setIsShowFileDetail(false);
    },[deleteFileCode]);
    const closeDeleteModal = useCallback(()=>setIsDeleteModal(false),[]);
    const openDeleteModal = useCallback((fileCode) => { setIsDeleteModal(true); setDeleteFileCode(fileCode)},[]);
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
    },[selectedMenuFolderCode]);
    const closeRenameFolderModal = useCallback(()=>setIsRenameFolderModalOpen(false),[]);


    const handleCreateFolderModalSubmit = async (folderName) => {    //새 폴더 모달 제출 후
        const res = await api.post('/main/folder', { folderName: folderName, folderCode: folderCode });
        setFiles(prev => ({ ...prev, folders: [...prev.folders, res.data] }));
        setIsCreateFolderModalOpen(false);
    }
    /**모달을 출력하는 함수*/
    const openUploadModal = (e) => {
        setFile(e.target.files[0]);
        e.target.value = null;
        setIsModalOpen(true);
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
        getMyFileData();
    }, [getMyFileData]);

    return (
        <>

            <div className={s.mainContainer} onClick={() => setIsMenuVisible(false)}>
                <div className={s.container}>
                    <div>
                        <h1>개인 클라우드</h1>
                        <h5>누구도 볼 수 없습니다.<br /></h5>
                    </div>                    
                    <div className={s.customFileUpload}>
                        <label htmlFor="fileInput" className={s.customUploadButton}>파일 업로드</label>
                        <input id="fileInput" type="file" onChange={openUploadModal} />
                        <button onClick={() => setIsCreateFolderModalOpen(true)}>새 폴더</button>
                        {history.length !== 0 && <button onClick={back}>뒤로가기</button>}
                    </div>
                    <div className={s.hr}></div>
                    <div className={s.allFilesContainer}>
                        <div className={s.foldersContainer}>
                            {
                                //폴더 부터 보여주기
                                files &&
                                files.folders.map((folder) => (
                                    <div key={folder.folderCode}>
                                        <ShowDatas folder={folder} intoFolder={intoFolder} file={null} handleContextMenu={handleContextMenu} />
                                    </div>
                                ))
                            }
                        </div>
                        <div className={s.filesContainer}>
                            {
                                //파일 보여주기
                                files &&
                                files.files.map((file) => (
                                    <div key={file.fileCode}>
                                        <ShowDatas folder={null} intoFolder={null} file={file} showDetailOfFile={showDetailOfFile} setSelectedFile={setSelectedFile} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                {isShowFileDetail &&
                    <Filedetail
                        isShowFileDetail={isShowFileDetail}
                        setIsShowFileDetail={setIsShowFileDetail}
                        selectedFile={selectedFile}
                        openDeleteModal={openDeleteModal} />}
                {isMenuVisible && (
                    <div className={s.menuContainer} style={{ top: menuPosition.y, left: menuPosition.x, }}>
                        <ul className={s.menu}>
                            <li onClick={deleteFolder}>삭제하기</li>
                            <li onClick={() => setIsRenameFolderModalOpen(true)}>이름 변경하기</li>
                        </ul>
                    </div>
                )}
            </div>
            {isModalOpen&&<CustomModal
                message={loading.uploadPrepare ? '업로드 준비 중. 배경을 클릭하지마세요.' : loading.uploading ? '업로드 중. 배경을 클릭하지마세요.' : '파일 이름을 입력하세요.'}
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                isInput={!loading.uploading || !loading.uploading}
                percent={bigFilePercent}
                loading={loading.uploadPrepare || loading.uploading}
            />}
            {isDeleteModal&&<CustomModal
                message="삭제하시겠습니까?"
                isOpen={isDeleteModal}
                onClose={closeDeleteModal}
                onSubmit={handleDeleteFormSubmit}
                isInput={false}
            />}
            {isCreateFolderModalOpen&&<CustomModal
                message="폴더 이름을 입력하세요."
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onSubmit={handleCreateFolderModalSubmit}
                isInput={true}
            />}
            {isRenameFolderModalOpen&&<CustomModal
                message="변경할 폴더 이름을 입력하세요."
                isOpen={isRenameFolderModalOpen}
                onClose={closeRenameFolderModal}
                onSubmit={handleRenameFormSubmit}
                isInput={true}
            />}
        </>
    );
}

export default PCMainUpdate;