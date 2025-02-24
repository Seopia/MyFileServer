import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiUrl } from "../../../common/api";
import s from './PublicUpload.module.css';
import { Tooltip } from "react-tooltip";
import { truncateString } from "../../function";
import QuillEditor from "../../../forum/pages/QuillEditor";
import { useEffect } from "react";
import { uploadEarly, uploadEarlyWithSmallFile } from "../apiFunction";
import { ClipLoader, PacmanLoader, PulseLoader } from "react-spinners";

const PublicUpload = () => {
    const nav = useNavigate();
    const [msg, setMsg] = useState(false);

    const [uploadFiles, setUploadFiles] = useState({});
    const [uploadState, setUploadState] = useState({loading:false,uploadLoading:false,mergeLoading:false,uploadPercent:0,complete:false});
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [category,setCategory] = useState('');

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
            const res = await api.post(`/public`,ob);
            if(res.data){
                nav(-1);
            } else {
                alert('Error 발생! 콘솔 확인');
                console.log(res);
            }
        } else {
            alert('파일 업로드를 먼저 진행해주세요!')
        }
    }
    const earlyUpload = () => {
        setUploadState(p=>({...p,loading:true})); //로딩 true
        if(uploadFiles.size < 10 * 1024 * 1024){
            console.log('ss');
            
            uploadEarlyWithSmallFile(uploadFiles, (res)=>{
                setUploadState({loading:true,uploadLoading:true,mergeLoading:true,uploadPercent:100,complete:true});
                setUploadedFileName(res);
            });
        } else {
            uploadEarly(uploadFiles,
                (percent)=>{
                    setUploadState(p=>({...p,uploadLoading:true,uploadPercent:percent}));  //percent 세팅, 업로드 중 true
                },()=>{
                    setUploadState(p=>({...p,mergeLoading:true}));  //머지 중
                },(res)=>{
                    setUploadState(p=>({...p, complete:true})); //완료
                    setUploadedFileName(res);   //바뀐 파일 이름
                });
        }   
    }

    return(
        <div className={s.forumCreate}>
        <div className={s.containerHeader}>
            <h2 className={s.pageTitle}>공용 파일 업로드</h2>
            <button className={s.submitBtn} onClick={() => registForum()}>업로드 하기</button>
        </div>

        <div className={s.container}>

            <div>
                <div className={s.itemTitle}>제목</div>
                <input name="title" placeholder="" value={newPublicFilePost.title}
                    onChange={e => e.target.value.length <= 50 ? setNewPublicFilePost(p => ({...p,title: e.target.value})) : setMsg(newPublicFilePost.title.length > 50)}/>

                <div className={s.letterLength}>
                    {msg ? <div>제목은 50자까지 작성할 수 있어요!</div> : <div></div>}
                    <div><span>{newPublicFilePost.title.length}</span> / 50</div>
                </div>
            </div>
            <div style={{ marginTop: "2em" ,marginBottom:"1em"}}>
                <div className={s.itemTitle}>파일을 업로드 하세요.</div>
                <label className={s.fileUploadBtn} htmlFor="uploadInput">파일 업로드</label>
                <input className={s.uploadInput} type="file" id="uploadInput" name="files" onChange={e=>setUploadFiles(e.target.files[0])} />
                <select value={category} onChange={e=>setCategory(e.target.value)} className="custom-select">
                    <option disabled value="">카테고리를 선택해주세요.</option>
                    <option value="game">게임</option>
                    <option value="software">소프트웨어</option>
                    <option value="music">음악</option>
                    <option value="movie">영화</option>
                    <option value="drama">드라마</option>
                    <option value="tv">TV 프로그램</option>
                    <option value="porn">성인</option>
                    <option value="none">기타</option>
                </select>
                <Tooltip id="tooltip-file" />
                {
                    uploadFiles?.name ?
                        <div className={s.fileContainer}>
                            <div className={s.fileText}>파일</div>
                            <div className={s.files}>
                                <div className={s.file}>
                                    <div className={s.fileName} data-tooltip-id="tooltip-file" data-tooltip-content={uploadFiles.name}>{truncateString(uploadFiles.name, 20, true)}</div>
                                    <div className={s.deleteIcon} onClick={()=>{setUploadFiles({})}}><img src="/deleteIcon.png" alt="e" width={20}/></div>
                                </div>
                            </div>
                            {
                            //업로드 준비 중이 아닐 때
                            !uploadState.loading?
                            <button className={s.fileEarlyUploadButton} 
                                onClick={earlyUpload}
                                data-tooltip-id="tooltip-file" 
                                data-tooltip-content="파일을 미리 업로드 하면서 아래 글을 작성해보세요! 이 버튼을 눌러도 클라우드에 파일이 올라가진 않아요! 파일만 미리 올라가는 거에요.">파일만 먼저 미리 업로드 하기
                            </button>
                            :
                            //업로드 준비 중이고, 퍼센트가 0일 때, 
                            uploadState.loading&&uploadState.uploadPercent===0?
                            <div className={s.loading}>
                                <div>업로드 준비 중...</div>
                                <ClipLoader size={20} color="rgb(192, 216, 255)"/>
                            </div>
                            :
                            //퍼센트가 0이 아니고 머지 중이 아니어야 함
                            uploadState.uploadPercent!==0&&!uploadState.mergeLoading?
                            <div className={s.loading}>
                                {uploadState.uploadPercent}%
                                <PulseLoader size={10} color="rgb(192,216,255)"/>

                            </div>
                            :
                            //머지 중이고 완료된게 아닐 때
                            uploadState.mergeLoading && !uploadState.complete?
                            <div className={s.loading}>
                                거의 다 되었어요
                                <PacmanLoader size={10} color="rgb(192,216,255)"/>
                            </div>
                            :
                            //완료 했는지
                            uploadState.complete&&
                            <div>✅ 업로드 성공!</div>
                            }
                        </div>
                    :
                    <></>
                }

            </div>
            <div className={s.itemTitle}>내용</div>
            <div className={s.explain}>파일의 설명을 작성해주세요!🥰</div>
            <div className={s.containerContent}>
                <QuillEditor 
                    newForum={newPublicFilePost} 
                    setNewForum={setNewPublicFilePost} 
                    placeholder="파일에 대한 사진과, 설명 등 사용법을 자유롭게 작성해주세요."
                    publicFile={true}/>
            </div>
        </div>
    </div>
    )
}

export default PublicUpload;