import Pagination from 'react-js-pagination';
import s from './PublicMain.module.css';
import { useState } from 'react';
import { Search, Upload, Download, User, Calendar, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { formattedDateTime, prettyCategory } from '../function';
import { getPublicFileByCategoryAndSearchWord } from './apiFunction';
import { loginUrl } from '../../common/url';

const PublicMain = () => {
    const nav = useNavigate();
    //페이징 state 객체
    const [pg, setPg] = useState({ page: 0, totalElements: 0 });
    const [files, setFiles] = useState([]);
    const [searchWord, setSearchWord] = useState('');
    const [category, setCategory] = useState('all');
    const { data } = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(true)
    //카테고리, 검색어, 페이지 별로 파일 가져오기
    const getFiles = (category, searchWord) => {
        setCategory(category);
        getPublicFileByCategoryAndSearchWord(category, searchWord, pg.page, (res) => {
            setFiles(res.content);
            setPg((p) => ({ ...p, totalElements: res.totalElements }));
            setIsLoading(false);
        });
    }
    const changeCategory = (c) => {
        getFiles(c.eng, searchWord);
    }
    const uploadButton = () => {
        if(data){
            nav('/public/upload');
        } else {
            nav(loginUrl,{ state: { message: '로그인 먼저 해주세요.' } });
        }
    }
      const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }
    useEffect(() => { getFiles('all'); }, []);
    useEffect(() => { getFiles(category, searchWord); }, [pg.page, category]);
    const categories = [{ icon:'✅',name: '전체', eng: 'all' }, { icon:'🎮',name: '게임', eng: 'game' }, { icon:'💻',name: '소프트웨어', eng: 'software' }, { icon:'🎵',name: '음악', eng: 'music' }, { icon:'🎬',name: '영화', eng: 'movie' }, { icon:'📺',name: '드라마', eng: 'drama' }, { icon:'📻',name: 'TV 프로그램', eng: 'tv' }, { icon:'🔞',name: '성인', eng: 'porn' }, { icon:'📦',name: '기타', eng: 'none' },]
  return (
    <div className={s.pageWrapper}>
      {/* 배경 효과 */}
      <div className={s.backgroundEffects}>
        <div className={s.gradientOrb1}></div>
        <div className={s.gradientOrb2}></div>
        <div className={s.gradientOrb3}></div>
        <div className={s.gridPattern}></div>
      </div>
      
      <div className={s.container}>
        {/* 헤더 섹션 */}
        <header
          className={s.header}
        >
          <div className={s.headerContent}>
            <h1 className={s.pageTitle}>
              <span className={s.titleIcon}>☁️</span>
              공용 클라우드
            </h1>
            <p className={s.pageDescription}>
              다양한 파일을 공유하고 다운로드하세요. 누구나 접근 가능한 공용 저장소입니다.
            </p>
          </div>
        </header>

        {/* 검색 및 업로드 섹션 */}
          <div className={s.searchContainer}>
            <div className={s.searchInputWrapper}>
              <Search className={s.searchIcon} size={20} />
              <input
                type="text"
                placeholder="파일 이름을 검색하세요..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') getFiles(category, searchWord)
                }}
                className={s.searchInput}
              />
            </div>

            <button className={s.uploadButton} onClick={uploadButton}>
              <Upload size={18} />
              <span>업로드</span>
            </button>
          </div>

          <div className={s.categoryContainer}>
            {categories.map((c, index) => (
              <div
                key={c.eng}
                className={`${s.categoryItem} ${category === c.eng ? s.active : ''}`}
                onClick={() => changeCategory(c)}
              >
                <span className={s.categoryIcon}>{c.icon}</span>
                <span className={s.categoryName}>{c.name}</span>
              </div>
            ))}
          </div>

        {/* 파일 목록 섹션 */}
        <div className={s.contentSection}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>
              {category === 'all' ? '모든 파일' : `${prettyCategory(category)} 파일`}
            </h2>
            <div className={s.resultCount}>
              총 <span className={s.countHighlight}>{pg.totalElements}</span>개의 파일
            </div>
          </div>

          {isLoading ? (
            <div className={s.loadingContainer}>
              <div className={s.spinner}></div>
              <p className={s.loadingText}>파일을 불러오는 중...</p>
            </div>
          ) : (
            <div className={s.fileGrid}>
                {files.map((file, index) => (
                  <div
                    key={file.fileCode}
                    className={s.fileCard}
                    onClick={() => nav(`/public/file/${file.fileCode}`)}
                  >
                    <div className={s.cardHeader}>
                      <div className={s.categoryBadge}>
                        {prettyCategory(file.category)}
                      </div>
                    </div>
                    
                    <h3 className={s.fileTitle}>{file.title}</h3>
                    
                    <p className={s.fileDescription}>{file.description}</p>
                    
                    <div className={s.fileMetadata}>
                      <div className={s.metaItem}>
                        <User size={14} className={s.metaIcon} />
                        <span>{file.id}</span>
                      </div>
                      <div className={s.metaItem}>
                        <Calendar size={14} className={s.metaIcon} />
                        <span>{formattedDateTime(file.uploadedAt)}</span>
                      </div>
                    </div>
                    
                    <div className={s.cardFooter}>
                      <div className={s.downloadInfo}>
                        <Download size={14} className={s.downloadIcon} />
                        <span>{file.downloadCount.toLocaleString()}회</span>
                      </div>
                      <div className={s.fileSize}>{formatFileSize(file.fileSize)}</div>
                      <div className={s.viewDetails}>
                        <span>상세보기</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {!isLoading && (
              <Pagination
                activePage={pg.page + 1}
                itemsCountPerPage={9}
                totalItemsCount={pg.totalElements}
                onChange={(page) => setPg((p) => ({ ...p, page: page - 1 }))}
                innerClass={s.paginationList}
                itemClass={s.pageItem}
                linkClass={s.pageLink}
                activeClass={s.active}
                activeLinkClass={s.activeLink}
                prevPageText="‹"
                nextPageText="›"
                firstPageText="«"
                lastPageText="»"
              />
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicMain;