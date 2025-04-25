import React, { useEffect, useState } from 'react'
import s from './Tutorial.module.css';
import { useNavigate } from 'react-router-dom';
// import {ReactComponent as FolderIcon} from './assets/folder.svg'

const Tutorial = () => {
  const nav = useNavigate();
  const [scroll, setScroll] = useState(0);
  const [isMobile, setIsMobile] = useState();
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const handleScroll = () => {
      setScroll(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  }, []);
  const goService = (e) => {
    nav(`/${e.target.name}`);
  }

  useEffect(() => {
    console.log(scroll);
  }, [scroll])

  const text = "돈 걱정 없이 자유롭게";

  return (
    <div className={s.container}>
      <h1 className={s.title}>무료 파일 클라우드</h1>
      <h1 className={s.subTitle}> {text.split('').map((char, i) => (
        <span key={i} className={s.wave} style={{ animationDelay: `${i * 0.1}s` }}>
          {char}
        </span>
      ))}
      </h1>
      <h4>아래로 스크롤해보세요.</h4>
      <div style={scroll > (isMobile ? 100 : 300) ? { position: 'fixed', top: 50, right: 20, opacity:0.6 } : {}} className={s.loginButtonContainer}>
        <button name='' onClick={goService}>Login</button>
        <button name='join' onClick={goService}>Join</button>
      </div>
      <section className={s.section1}>
        <h1 className={s.section1h1} style={{ transform: scroll > (isMobile ? 100 : 300) ? `translateX(0)` : `translateX(-1000%)` }}>개인 클라우드</h1>
        <div className={s.section1Text1} style={{ transform: scroll > (isMobile ? 100 : 300) ? `translateX(0)` : `translateX(-500%)` }}>아무도 열람할 수 없습니다.</div>
        <div className={s.img} style={{
          opacity: scroll > (isMobile ? 100 : 300) ? 1 : 0,
        }}>

          <img style={{ borderRadius: 10, width: '80vw' }} src='/tutorial/private.png' alt='error' />
        </div>

        <div style={{ fontSize: '2em', paddingBottom: '30px', paddingTop: 30 }}>폴더로 관리해보세요.</div>

        <div className={s.section1List}>


          <div className={s.folderBox} style={{
            transform: scroll > (isMobile ? 200 : 500) ? `translateX(0)` : `translateX(-1000%)`,
            transition: 'all 2.1s ease',
            position:'relative',
          }}>
            <img className={s.folderImg} style={{ position: 'absolute', top: 0 }} width="250" src="/folder.svg" />
            <span className={s.folderLabel}>파일 업로드</span>
          </div>


          <div className={s.folderBox} style={{
            transform: scroll > (isMobile ? 200 : 520) ? `translateX(0)` : `translateX(-1000%)`,
            transition: 'all 1.4s ease'
          }}>
            <img className={s.folderImg} style={{ position: 'absolute', top: 0 }} width="250" src="/folder.svg" />
            <span className={s.folderLabel}>다운로드</span>
          </div>


          <div className={s.folderBox} style={{
            transform: scroll > (isMobile ? 200 : 500) ? `translateX(0)` : `translateX(-1000%)`,
            transition: 'all 1s ease'
          }}>
            <img className={s.folderImg} style={{ position: 'absolute', top: 0 }} width="250" src="/folder.svg" />
            <span className={s.folderLabel}>새 폴더</span>
          </div>


          <div className={s.folderBox} style={{
            transform: scroll > (isMobile ? 200 : 550) ? `translateX(0)` : `translateX(-800%)`,
            transition: 'all 2s ease'
          }}>
            <img className={s.folderImg} style={{ position: 'absolute', top: 0 }} width="250" src="/folder.svg" />
            <span className={s.folderLabel}>삭제</span>
          </div>
          <div className={s.folderBox} style={{
            transform: scroll > (isMobile ? 200 : 400) ? `translateX(0)` : `translateX(-1000%)`,
            transition: 'all 1.3s ease'
          }}>
            <img className={s.folderImg} style={{ position: 'absolute', top: 0 }} width="250" src="/folder.svg" />
            <span className={s.folderLabel}>파일 미리보기</span>
          </div>
          <div className={s.folderBox} style={{
            transform: scroll > (isMobile ? 200 : 400) ? `translateX(0)` : `translateX(-1000%)`,
            transition: 'all 1.1s ease'
          }}>
            <img className={s.folderImg} style={{ position: 'absolute', top: 0 }} width="250" src="/folder.svg" />
            <span className={s.folderLabel}>파일, 폴더 이름 변경</span>
          </div>
        </div>


      </section>

      <hr className={s.sectionDevider} />

      <section className={s.section2}>
        <h1 className={s.section1h1} style={{ transform: scroll > (isMobile ? 800 : 1900) ? `translateX(0)` : `translateX(-1000%)` }}>공용 클라우드</h1>
        <div className={s.section1Text1} style={{ transform: scroll > (isMobile ? 900 : 2000) ? `translateX(0)` : `translateX(-500%)` }}>자랑스러운 순간을 모두에게 보여주세요.</div>
        <div className={s.img} style={{
          opacity: scroll > (isMobile ? 1000 : 2100) ? 1 : 0,
        }}>
          <img style={{ borderRadius: 10, width: '80vw' }} src='/tutorial/public.png' alt='error' />
        </div>
        <div className={s.section2TextBox1}>자랑스러운 작품이나, 순간을 모두에게 보여주세요.</div>
      </section>

      <hr className={s.sectionDevider} />
      <section>
        <h1 className={s.section1h1} style={{ transform: scroll > (isMobile ? 1100 : 2500) ? `translateX(0)` : `translateX(-1000%)` }}>그룹 클라우드</h1>
        <div className={s.section1Text1} style={{ transform: scroll > (isMobile ? 1300 : 2600) ? `translateX(0)` : `translateX(-500%)` }} >팀을 만들어 비밀스러운 파일을 함께 공유하세요.</div>
        <div className={s.img} style={{
          opacity: scroll > (isMobile ? 1700 : 3000) ? 1 : 0,
        }}>
          <img style={{ borderRadius: 10, width: '80vw' }} src='/tutorial/group.png' alt='error' />
        </div>
      </section>

      <hr className={s.sectionDevider} />

      <section className={s.section2}>
        <h1 className={s.section1h1} style={{ transform: scroll > (isMobile ? 1200 : 4200) ? `translateX(0)` : `translateX(-1000%)` }}>자유 게시판</h1>
        <div className={s.section1Text1} style={{ transform: scroll > (isMobile ? 1300 : 4500) ? `translateX(0)` : `translateX(-500%)` }}>사람들과 자유롭게 소통하세요.</div>
        <div className={s.img} style={{
          opacity: scroll > (isMobile ? 1700 : 4400) ? 1 : 0,
        }}>
          <img style={{ borderRadius: 10, width: '80vw' }} src='/tutorial/forum.png' alt='error' />
        </div>
        <div className={s.section2TextBox1}>
          사진, 파일을 업로드할 수 있습니다.</div>

        <h1>무료로 이용해보세요</h1>
        <div className={s.freeArrowContainer}>
          <div className={s.arrow}>
            <span></span>
          </div>
        </div>
        <div style={{ paddingBottom: 100 }} className={s.loginButtonContainer}>
          <button name='' onClick={goService}>Login</button>
          <button name='join' onClick={goService}>Join</button>
        </div>
      </section>
    </div>
  )
}

export default Tutorial;