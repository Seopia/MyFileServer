import { Outlet, useNavigate } from 'react-router-dom';
import s from './SideBar.module.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../reducer/UserDataSlice';
const SideBar = () => {
    
    const nav = useNavigate();
    const dispatch = useDispatch();
    const {data, state} = useSelector((state)=>state.user);
    const [isMobile, setIsMobile] = useState();
    
    const logout = () => {
        localStorage.removeItem('token');
        nav('/');
    }
    useEffect(()=>{
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        if(!data && state !== 'loading' && state !== 'success'){  
            dispatch(getUser());
        }        
    },[data, dispatch, state])
    return(
        <>
            {!isMobile && 
            (
            <>   
            <div className={s.faker}></div>
            <div className={s.sidebarContainer}>
                <div onClick={()=>nav('/main')} className={s.title}><img alt='Error' style={{marginRight:20}} width={50} src='/icon.png'/>Cloud</div>
                <div>
                    <button onClick={logout} className={s.logout}>Logout</button>
                    <button onClick={()=>nav(`/user/${data.userCode}`)} className={s.logout}>My Page</button>
                </div>
                <ul className={s.list}>
                    <li onClick={()=>{nav(`/main`)}}>개인 클라우드</li>
                    <li onClick={()=>{nav('/public')}}>공용 클라우드</li>
                    <li onClick={()=>nav('group/select')}>그룹 클라우드</li>
                    <li onClick={()=>nav('/forum')}>자유 게시판</li>
                    {data && data.userRole === 'ROLE_ADMIN'&&<li onClick={()=>nav('/admin/user')}>관리자 페이지</li>}
                    {/* {data && data.userRole === 'ROLE_ADMIN'&&<li onClick={()=>nav('/t')}>테스트 페이지</li>} */}
                </ul>
                </div>
            </>
            )}  
            <Outlet context={isMobile}/>
      </>
    )
}

export default SideBar;