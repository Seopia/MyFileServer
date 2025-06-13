import React, { useCallback, useEffect, useState } from 'react';
import CustomModal from '../../common/CustomModal';
import api from '../../common/api';
import { deleteFile } from '../../main/function';
// import ShowDatas from '../../main/PC/ShowDatas';
import s from './Group.module.css';
import Filedetail from '../../personal/components/FileDetail';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { groupDeleteGroup, groupGetThisGroup, groupUploadChunk } from '../apiGroupFunction';
import { useSelector } from 'react-redux';
import { Loading } from '../../common/Loading';

function Group() {
    const {code} = useParams();
    const isMobile = useOutletContext();
    const [history, setHistory] = useState([]);
    const nav = useNavigate();
    const {data} = useSelector((state)=>state.user);
    const [folderCode, setFolderCode] = useState(null);
    const [isShowFileDetail, setIsShowFileDetail] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [selectedMenuFolderCode, setSelectedMenuFolderCode] = useState(null);
    const [loading, setLoading] = useState({upload:false});

    const [group, setGroup] = useState({});
    const [showGroupMember, setShowGroupMember] = useState(false);
    const [members, setMembers] = useState([]);
    //지금 현재 화면에 렌더링하는 데이터 state
    const [files, setFiles] = useState(null);

    //파일 업로드 관련 state
    const [file, setFile] = useState(null);
    const [deleteFileCode, setDeleteFileCode] = useState(0);
    const [uploadFolderCode, setUploadFolderCode] = useState(null);
    /**모달 관리 state*/
    const [percent, setPercent] = useState(0);
    const [bigFilePercent, setBigFilePercent] = useState(0);
    const [modalOpenStatus, setModalOpenStatus] = useState({isUploadModalOpen: false, isDeleteModalOpen: false, isCreateFolderModalOpen: false, isRenameFolderModalOpen: false, isGroupDeleteModalOpen: false,});
    //파일 업로드 모달
    const handleFormSubmit = useCallback(async (fileName) => {
        setLoading((p)=>({...p, upload: true}));
        if(file.size>(100 * 1024 * 1024)){
            groupUploadChunk(file, fileName, folderCode, code, (res)=>{
                setFiles(prev => ({ ...prev, files: [...prev.files, res] }));
                setBigFilePercent(0);
            },setBigFilePercent,setLoading);
            setModalOpenStatus(m=>({...m, isUploadModalOpen: false}));
            alert('파일 용량이 커 분할 업로드로 전환합니다. 페이지를 전환하지 마세요.');
        } else {
            const res = await api.post('/main/upload', { file: file, description: fileName, isPrivate: false, folderCode: uploadFolderCode }, {
            
            onUploadProgress: (e) => {
                const p = Math.round((e.loaded * 100) / e.total);
                setPercent(p);
            }
            });
            setFiles(prev => ({ ...prev, files: [...prev.files, res.data] }))
            setModalOpenStatus(m=>({...m, isUploadModalOpen: false})); setPercent(0);
            setLoading((p)=>({...p, upload: false}));
        }
        
        



    },[file,uploadFolderCode,code,folderCode]);
    //삭제 모달
    const handleDeleteFormSubmit = useCallback(async () => {
        await deleteFile(deleteFileCode);
        setFiles((prev) => ({ ...prev, files: prev.files.filter(file => file.fileCode !== deleteFileCode), }));
        setModalOpenStatus(m=>({...m,isDeleteModalOpen:false}));
        setIsShowFileDetail(false);
    },[deleteFileCode]);
    const openDeleteModal = useCallback((fileCode) => { setModalOpenStatus(m=>({...m,isDeleteModalOpen:true})); setDeleteFileCode(fileCode)},[]);
    //폴더 이름 바꾸기 모달
    const handleRenameFormSubmit = useCallback(async (data) => {
        await api.post('/main/folder-name', { folderCode: selectedMenuFolderCode, description: data });
        setFiles((prevState) => ({
            ...prevState,
            folders: prevState.folders.map((folder) =>
                folder.folderCode === selectedMenuFolderCode
                    ? { ...folder, folderName: data }
                    : folder)}));
        setModalOpenStatus(m=>({...m,isRenameFolderModalOpen:false}));
    },[selectedMenuFolderCode]);
    //새 폴더 모달
    const handleCreateFolderModalSubmit = async (folderName) => {
        const res = await api.post('/group/folder', { groupCode:code,folderName: folderName, folderCode: folderCode });
        setFiles(prev => ({ ...prev, folders: [...prev.folders, res.data] }));
        setModalOpenStatus({...modalOpenStatus,isCreateFolderModalOpen:false});
    }
    //파일 업로드 모달
    const openUploadModal = (e) => {
        setFile(e.target.files[0]);
        e.target.value = null;
        setModalOpenStatus({...modalOpenStatus, isUploadModalOpen: true});
    }
    //그룹 삭제 모달
    const deleteGroup = async (text) => {
        if(text==="삭제한다"){
            groupDeleteGroup(code,(r)=>{
                r?nav('/group/select'):console.log('실패함');
            });
        }else{
            return;
        }
        setModalOpenStatus({...modalOpenStatus,isGroupDeleteModalOpen:false});
    }


    //폴더안에 있는 폴더,파일을 가져오는 함수
    const getMyFileData = useCallback(async (folderCode) => {
        //만약 폴더 코드를 인자로 주지 않았다면?
        if (!folderCode) {
            //최상단 폴더 조회하기
            const { data } = await api.get(`/group-root-folder?groupCode=${code}`);
            folderCode = data;
            setFolderCode(data.folderCode);
            setUploadFolderCode(data.folderCode);
        }
        //화면에 렌더링할 파일, 폴더 가져오기
        const myFiles = await api.get(`/group/file?folderCode=${folderCode}&groupCode=${code}`);
        setFolderCode(myFiles.data.folderCode);
        setFiles(myFiles.data);
        setUploadFolderCode(myFiles.data.folderCode);

    }, [code]);


    //폴더 내부로 들어갈 때 호출되는 함수
    const intoFolder = (folderCode) => {setHistory((prev) => [...prev, folderCode]);setIsShowFileDetail(false);}
    //뒤로가기
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
    const showDetailOfFile = (file) => {
        setIsShowFileDetail(true);
        setSelectedFile(file);
    }

    const handleContextMenu = (event, folderCode) => {
        setSelectedMenuFolderCode(folderCode);
        event.preventDefault();
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
        //그룹 권한 체크해야 함
        groupGetThisGroup(code,(r)=>{setGroup(r)});
    }, [getMyFileData,code]);

    const getGroupMembers = useCallback(async () => {
        const res = await api.get(`/group/member?groupCode=${code}`);
        setMembers(res.data);
        console.log(res.data);
        
    },[code]);
    const removeMember = (member) => {
        console.log(member);
        alert('추방 기능 구현 중');
    }   
    
    useEffect(()=>{
        getGroupMembers();
    },[getGroupMembers]);
    
    return (
        <>
            <aside style={showGroupMember?
                {width:'30vw',height:'100vh',top:'0px',right:'0px',boxShadow:'0 0 10px 5px rgb(67, 89, 122)'}
                :
                {width:'70px',bottom:'10%',right:'5%',height:'70px',borderRadius:10,color:'white',display:'flex',justifyContent:'center',alignItems:'center',cursor:'pointer',boxShadow:'2px 2px 4px 1px rgb(115, 149, 201)',fontSize:'0.8em'}
                    } onClick={()=>setShowGroupMember(true)} className={s.groupMemberContainer}>
                {!showGroupMember?<div>Members</div>:
                <div>
                    <div className={s.groupMemberHeader}>
                        <button onClick={(e)=>{e.stopPropagation();setShowGroupMember(false);}}>닫기</button>
                        <div>함께하는 가족들을 소개합니다.</div>
                        <div style={{fontSize:'0.8em'}}>닉네임을 클릭하면 소개 페이지로 이동합니다!</div>
                    </div>
                    <div className={s.groupMember}>
                    {members.map((member)=>(
                        <div key={member.userCode} className={s.member}>
                            <div style={{cursor:'pointer'}} onClick={()=>nav(`/user/${member.userCode}`)}>{member.id}</div>
                            {group.manager===data?.userCode&&<button onClick={()=>removeMember(member)}>추방</button>}
                        </div>
                    ))}
                    </div>
                </div>
                }
            </aside>
            <div className={s.mainContainer} onClick={() => setIsMenuVisible(false)}>
                {bigFilePercent!==0&&<div style={{position:'absolute',  right:50, top: 50,display:'flex'}}><h1>{bigFilePercent}</h1><Loading type='pacman' text=''/></div>}
                <div className={s.container}>
                    <div>
                        {isMobile?<></>:<h1>{group.name}</h1>}
                        <h5>{group.description}<br /></h5>
                    </div>
                    <div className={s.customFileUpload}>
                        <label htmlFor="fileInput" className={s.customUploadButton}>{loading.upload ? <Loading text='업로드 중..'/>  : '파일 업로드'}</label>
                        <input disabled={loading.upload} id="fileInput" type="file" onChange={openUploadModal} />
                        <button onClick={() => setModalOpenStatus({...modalOpenStatus,isCreateFolderModalOpen:true})}>새 폴더</button>
                        {history.length !== 0 && <button onClick={back}>뒤로가기</button>}
                        {group.manager===data?.userCode&&<button onClick={()=>setModalOpenStatus({...modalOpenStatus,isGroupDeleteModalOpen:true})}>그룹 삭제하기</button>}
                        {group.manager===data?.userCode&&<button onClick={()=>nav(`/group/management/${code}`)}>그룹 관리하기</button>}
                    </div>
                    <div className={s.hr}></div>
                    <div className={s.allFilesContainer}>
                        <div className={s.foldersContainer}>
                            {
                                //폴더 부터 보여주기
                                files &&
                                files.folders.map((folder) => (
                                    <div key={folder.folderCode}>
                                        {/* <ShowDatas folder={folder} intoFolder={intoFolder} file={null} handleContextMenu={handleContextMenu} /> */}
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
                                        {/* <ShowDatas folder={null} intoFolder={null} file={file} showDetailOfFile={showDetailOfFile} setSelectedFile={setSelectedFile} /> */}
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
                            <li onClick={() => setModalOpenStatus({...modalOpenStatus,isRenameFolderModalOpen:true})}>이름 변경하기</li>
                        </ul>
                    </div>
                )}
            </div>
            {modalOpenStatus.isUploadModalOpen&&<CustomModal
                message="업로드 할 파일 이름을 입력하세요."
                isOpen={modalOpenStatus.isUploadModalOpen}
                onClose={()=>setModalOpenStatus({...modalOpenStatus, isUploadModalOpen: false})}
                onSubmit={handleFormSubmit}
                isInput={true}
                percent={percent}
            />}
            {modalOpenStatus.isDeleteModalOpen&&<CustomModal
                message="삭제하시겠습니까?"
                isOpen={modalOpenStatus.isDeleteModalOpen}
                onClose={()=>setModalOpenStatus({...modalOpenStatus,isDeleteModalOpen:false})}
                onSubmit={handleDeleteFormSubmit}
                submitMessage="예"
                closeMessage="아니오"
                isInput={false}
            />}
            {modalOpenStatus.isCreateFolderModalOpen&&<CustomModal
                message="폴더 이름을 입력하세요."
                isOpen={modalOpenStatus.isCreateFolderModalOpen}
                onClose={() => setModalOpenStatus({...modalOpenStatus,isCreateFolderModalOpen:false})}
                onSubmit={handleCreateFolderModalSubmit}
                isInput={true}
            />}
            {modalOpenStatus.isRenameFolderModalOpen&&<CustomModal
                message="변경할 폴더 이름을 입력하세요."
                isOpen={modalOpenStatus.isRenameFolderModalOpen}
                onClose={()=>setModalOpenStatus({...modalOpenStatus,isRenameFolderModalOpen:false})}
                onSubmit={handleRenameFormSubmit}
                isInput={true}
            />}
            {modalOpenStatus.isGroupDeleteModalOpen&&<CustomModal
                message={"이 그룹을 제거하려면 '삭제한다'를 입력해주세요."}
                isOpen={modalOpenStatus.isGroupDeleteModalOpen}
                onClose={()=>setModalOpenStatus({...modalOpenStatus,isGroupDeleteModalOpen:false})}
                onSubmit={deleteGroup}
                submitMessage="제거하기"
                closeMessage="취소"
                placeholder="그룹을 제거하려면 삭제한다를 입력해주세요."
                isInput={true}
            />}
        </>
    );
}

export default Group;