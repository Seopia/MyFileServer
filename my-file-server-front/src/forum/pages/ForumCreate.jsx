import QuillEditor from "./QuillEditor"
import s from "./ForumCreate.module.css";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import MobileHeader from "../../main/Mobile/Component/MobileHeader";
import axios from "axios";
import { apiUrl } from "../../common/api";
import { truncateString } from "../../main/function";
import { Tooltip } from "react-tooltip";


const ForumCreate = () => {
    const isMobile = useOutletContext();
    const nav = useNavigate();
    const [msg, setMsg] = useState(false);

    const [uploadFiles, setUploadFiles] = useState([]);



    const [newForum, setNewForum] = useState({
        forumCode: 0,
        title: "",
        content: "",
        files: [],
    });


    const registForum = async () => {

        try {
            if (window.confirm("게시글을 등록하시겠습니까? \n(등록 후 수정이 불가합니다.)")) {

                const f = new FormData();
                f.append("title", newForum.title);
                f.append("content", newForum.content);
                for (let i = 0; i < uploadFiles.length; i++) {
                    f.append("files", uploadFiles[i]);
                }

                await axios.post(`${apiUrl}/forum`, f, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                })
                nav(-1);
            }

        } catch (err) {
            console.log(err);

        }
    }

    return <div className={s.forumCreate}>
        {isMobile && <MobileHeader title='글 쓰기' />}
        <div className={s.containerHeader}>
            <h2 className={s.pageTitle}>게시글 작성</h2>
            <button className={s.submitBtn} onClick={() => registForum()}>등록</button>
        </div>

        <div className={s.container}>

            <div>
                <div className={s.itemTitle}>제목</div>
                <input name="title" placeholder="" value={newForum.title}
                    onChange={(e) => {

                        if (e.target.value.length <= 70) {
                            setNewForum((prev) => ({
                                ...prev,
                                title: e.target.value
                            }));
                        }

                        setMsg(e.target.value.length > 70);

                    }} />

                <div className={s.letterLength}>
                    {msg ? <div>제목은 70자까지 작성할 수 있어요!</div> : <div></div>}
                    <div><span>{newForum.title.length}</span> / 70</div>
                </div>
            </div>
            <div style={{ marginTop: "2em" ,marginBottom:"1em"}}>
                <div className={s.itemTitle}>첨부 파일을 업로드 하세요.</div>
                <label className={s.fileUploadBtn} htmlFor="uploadInput">파일 업로드</label>
                <input type="file" id="uploadInput" name="files" multiple onChange={(e) => {
                    setUploadFiles((p)=>[...p, ...Array.from(e.target.files)]);
                }
                } />
                <Tooltip id="tooltip-file" />
                {
                    uploadFiles.length > 0 ?
                        <div className={s.fileContainer}>
                            <div className={s.fileText}>첨부파일</div>
                            <div className={s.files}>
                            {uploadFiles.map((file, i) => (
                                <div key={i} className={s.file}>
                                    <div data-tooltip-id="tooltip-file" data-tooltip-content={file.name}>{truncateString(file.name, 20, true)}</div>
                                    <button onClick={()=>{
                                        setUploadFiles((fs)=>fs.filter(f=>f.name===file.name?undefined:f));
                                    }}><img src="/deleteIcon.png" alt="e" width={20}/></button>
                                </div>
                            ))}
                            </div>
                        </div>
                        :
                        <></>
                }

            </div>
            <div className={s.itemTitle}>내용</div>
            <div className={s.explain}>자유롭게 작성해주세요!🥰</div>
            <div className={s.containerContent}>
                <QuillEditor newForum={newForum} setNewForum={setNewForum} />
            </div>



        </div>


        {/* 미리보기 */}
        {/* <div className={s.cloud}></div> */}

    </div>

}

export default ForumCreate;