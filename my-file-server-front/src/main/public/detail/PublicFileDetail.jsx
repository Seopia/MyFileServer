import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteCommentPublicFile, deletePublicFile, downloadPublicFile, getCommentPublicFile, getFileByFileCode, recommendPublicFile, writeCommentPublicFile, writeLog } from "../apiFunction";
import { useState } from "react";
import { calcFileSize, formattedDateTime, prettyCategory } from "../../function";
import s from './PublicFileDetail.module.css';
import DOMPurify from 'dompurify';
import { useSelector } from "react-redux";
import CustomModal from "../../../common/CustomModal";


const PublicFileDetail = () => {
    const { fileCode } = useParams();
    const nav = useNavigate();
    const {data} = useSelector((state)=>state.user);
    const [modalState, setModalState] = useState({
        deleteModal:false,
    })
    
    const [file, setFile] = useState({category:'',changedName:'',description:'',downloadCount:0,fileCode:fileCode,fileFullPath:'',originalName:'',size:'',title:'',uploadedAt:[],user:{userCode:0,id:''},recommendCount:0});
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const getFile = async () => {
        getFileByFileCode(fileCode, (res)=>{            
            setFile(res);            
        });
    }
    const recommend = () => {
        recommendPublicFile(fileCode, ()=>{
            setFile((p)=>({...p, recommendCount: file.recommendCount + 1}));
        })
    }
    const deleteFile = () => {
        deletePublicFile(file.fileCode, ()=>{
            nav(-1);
        });
    }
    const download = () => {
        writeLog(file.fileCode);
        setFile(p=>({...p,downloadCount: file.downloadCount+1}));
        downloadPublicFile(file);
    }
    const SafeHTMLComponent = (content) => {
        const cleanHTML = DOMPurify.sanitize(content);
        return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
    }
    const getComment = async () => getCommentPublicFile(fileCode, res=>setComments(res));
    const writeComment = () => {
        writeCommentPublicFile(fileCode,commentInput,(res)=>{setComments((p)=>([res,...p]));setCommentInput('')});
    }
    const deleteComment = (comment) => {
        deleteCommentPublicFile(comment,(res)=>{
            setComments(prev=>prev.filter(i=>i.publicFileCommentCode !== comment.publicFileCommentCode));
        });
        
    }
    useEffect(()=>{getComment()},[]);
    useEffect(()=>{getFile();},[]);
    useEffect(()=>{
console.log(comments);

    },[comments])
    return(
        <section className={s.container}>
            <header className={s.header}>
                <h1 className={s.title}>{file.title}</h1>
                {file.recommendCount===0?<h3 style={{color:'rgb(249, 132, 132)'}}>이 파일이 마음에 든다면 추천 버튼을 눌러주세요.</h3>
                :<h3 style={{color:'rgb(250, 98, 98)'}}>{file.recommendCount} 명이 추천한 파일이에요.</h3>}
                {data?.userCode === file.user.userCode && 
                <button 
                    onClick={()=>setModalState(p=>({...p,deleteModal:true}))} 
                    className={s.deleteButton}>
                    <img width={20} src="/deleteIcon.png"/>
                    삭제하기
                </button>}
                <div className={s.headerBottom}>
                    <div>{`${file.uploadedAt[0]}년 ${file.uploadedAt[1]}월 ${file.uploadedAt[2]}일 ${file.uploadedAt[3]}시 업로드`}</div>
                    <div>업로드: {file.user.id}</div>
                </div>
                <div className={s.informationContainer}>
                    <div className={s.information}>
                        <div><b>파일 이름 :</b> {file.originalName}</div>
                        <div><b>용량 :</b> {calcFileSize(file.size)}</div>
                    </div>
                    <div className={s.information}>
                        <div style={file.category==='porn'?{color:'red'}:{}}><b>카테고리 :</b> {prettyCategory(file.category)}</div>
                        <div><b>다운로드 수 :</b> {file.downloadCount}</div>
                    </div>
                    <div className={s.buttonBox}>
                        <button onClick={download}>다운로드</button>
                        <button onClick={recommend}>추천하기</button>
                    </div>
                </div>
                <div className={s.hr}></div>
            </header>
            <section className={s.body}>
                <div className={s.content}>{SafeHTMLComponent(file.description)}</div>
            </section>
            <div className={s.buttonBox}>
                        <button onClick={download}>다운로드</button>
                        <button onClick={recommend}>추천하기</button>
                    </div>
            <div className={s.hr}></div>
            <footer>
                <div className={s.commentWriteContainer}>
                    <input placeholder="감사 인사를 남겨보세요." value={commentInput} onChange={(e)=>setCommentInput(e.target.value)}/>
                    <button onClick={writeComment}>작성</button>
                </div>
                <div className={s.commentContainer}>
                {
                    comments.map((comment)=>(
                        <div key={comment.publicFileCommentCode} className={s.comment}>
                            <div className={s.commentId}>{comment.user.id}</div>
                            <div className={s.commentBody}>
                                <div>{comment.content}</div>
                                <div className={s.commentFooter}>
                                    <div style={{whiteSpace:'nowrap',fontSize:'0.8em'}}>{formattedDateTime(comment.createAt)}</div>
                                    {/* <button>추천(개발 중)</button> */}
                                    {   data?.userCode === comment.user.userCode &&
                                        <button onClick={()=>deleteComment(comment)}
                                                className={s.commentDeleteButton}>
                                            <img width={20} src="/deleteIcon.png"/>
                                        </button>}
                                </div>
                            </div>
                        </div>
                    ))
                }
                </div>
            </footer>
            {modalState.deleteModal&&
                <CustomModal
                    message="삭제하시겠습니까?"
                    isOpen={modalState.deleteModal}
                    onClose={()=>setModalState(p=>({...p,deleteModal:false}))}
                    onSubmit={deleteFile}/>    
            }
        </section>
    )
}

export default PublicFileDetail;