import Pagination from 'react-js-pagination';
import s from './PublicMain.module.css';
import { useState } from 'react';
import { formattedDateTime, prettyCategory } from '../../function';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import AdultOnlyIcon from '../../../common/AdultOnlyIcon';
import { getPublicFileByCategoryAndSearchWord, writeLog } from '../apiFunction';
import { useEffect } from 'react';
import SearchBox from '../../../common/SearchBox';
import { useSelector } from 'react-redux';
import api from '../../../common/api';

const PublicMain = () => {
    const nav = useNavigate();
    //페이징 state 객체
    const [pg,setPg] = useState({page: 0,totalElements:0});
    const [files,setFiles] = useState([]);
    const [searchWord, setSearchWord] = useState('');
    const [category, setCategory] = useState('all');
    const {data} = useSelector((state)=>state.user);


    //카테고리, 검색어, 페이지 별로 파일 가져오기
    const getFiles = (category, searchWord) => {
        setCategory(category);
        getPublicFileByCategoryAndSearchWord(category, searchWord, pg.page,(res)=>{
            setFiles(res.content);
            setPg((p)=>({...p,totalElements:res.totalElements}));
        });
    }
    //다운로드
    const download = (file) => {
        writeLog(file.fileCode);
        window.open(file.fileFullPath,'_blank');
    }
    useEffect(()=>{getFiles('all');},[]);
    useEffect(()=>{getFiles(category,searchWord);},[pg.page]);
    const categores = [{name:'전체',eng:'all'},{name:'게임',eng:'game'},{name:'소프트웨어',eng:'software'},{name:'음악',eng:'music'},{name:'영화',eng:'movie'},{name:'드라마',eng:'drama'},{name:'TV 프로그램',eng:'tv'},{name:'성인',eng:'porn'},{name:'기타',eng:'none'},]
    return(
        <section className={s.container}>
            <Tooltip id="tooltip" />
            <header className={s.header}>
                <h1>공용 클라우드</h1>
                <h5>누구나 무료로 보고, 업로드하고, 다운로드할 수 있습니다.</h5>
                <h5>파일을 제한 없이 자유롭게 공유하세요. 다운로드 받는 것과, 조회하는 것 모두 절대 추적하지 않습니다. 안심하고 이용하세요.</h5>
            </header>
            <aside className={s.uploadContainer}>
                <button onClick={()=>nav('/public/upload')} className={s.uploadButton}>파일 업로드하기</button>
            </aside>
            <h3 className={s.categoryText}>카테고리</h3>
            <section className={s.categoryContainer}>
                <div className={s.category}>
                    {categores.map((ct,i)=>(ct.eng==='porn'?
                        <button key={i} className={ct.eng===category?s.selectedAdultButton:s.adultButton} onClick={()=>getFiles('porn')}>성인<AdultOnlyIcon/></button>:
                        <button key={i} className={ct.eng===category?s.selectedButton:s.unselectedButton} onClick={()=>getFiles(ct.eng)}>{ct.name}</button>
                    ))}
                </div>
                <SearchBox value={searchWord} setValue={setSearchWord} onClick={()=>{getFiles(category,searchWord)}}/>
            </section>

            <section className={s.body}>
                <table className={s.table}>
                    <thead>
                        <tr className={s.thtr}>
                            <th>제목</th>
                            <th>공유자</th>
                            <th>날짜</th>
                            <th>다운로드</th>
                            <th>분류</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            files.map((file) => (
                                <tr key={file.fileCode}>
                                    <td style={{display:'flex',alignItems:'center',gap:5}} onClick={()=>nav(`/public/file/${file.fileCode}`)}>{file.category==='porn'&&<AdultOnlyIcon/>}{file.title}</td>
                                    <td data-tooltip-id='tooltip' data-tooltip-content='클릭하면 마이페이지로 이동합니다.' onClick={()=>nav(`/user/${file.user.userCode}`)}>{file.user.id}</td>
                                    <td>{formattedDateTime(file.uploadedAt)}</td>
                                    <td><button onClick={()=>download(file)} className={s.download}>바로 다운로드</button></td>
                                    <td>{prettyCategory(file.category)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </section>

            <div className={s.pagination}>
                <Pagination
                activePage={pg.page}
                itemsCountPerPage={9}
                totalItemsCount={pg.totalElements}
                onChange={(page)=>setPg((p)=>({...p,page:page-1}))}/>
            </div>
        </section>
    )
}

export default PublicMain;