import { Outlet, useNavigate } from 'react-router-dom';
import s from './SideBar.module.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../reducer/UserDataSlice';
const SideBar = () => {
    
    const nav = useNavigate();
    const dispatch = useDispatch();
    const {data, state} = useSelector((state)=>state.user);
    const [isPublicCloud, setIsPublicCloud] = useState(false);
    const [isMobile, setIsMobile] = useState();
    
    const logout = () => {
        localStorage.removeItem('token');
        nav('/');
    }
    useEffect(()=>{
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        if(!data && state !== 'loading'){  
            dispatch(getUser());
        }        
    },[data, dispatch, state])
    return(
        <div>
            {!isMobile && 
            (
            <div>   
            <div className={s.sidebarContainer}>
                <div onClick={()=>nav('/main')} className={s.title}><img alt='Error' style={{marginRight:20}} width={50} src='/icon.png'/>Cloud</div>
                <div>
                    <button onClick={logout} className={s.logout}>Logout</button>
                    <button onClick={()=>nav(`/user/${data.userCode}`)} className={s.logout}>mypage</button>
                </div>
                <ul className={s.list}>
                    <li onClick={()=>{nav('/main');setIsPublicCloud(false)}}>개인 클라우드</li>
                    <li onClick={()=>{nav('/main');setIsPublicCloud(true)}}>공용 클라우드</li>
                    <li onClick={()=>nav('/forum')}>자유 게시판 (미구현)</li>
                    {data && data.userRole === 'ROLE_ADMIN'&&<li onClick={()=>nav('/admin')}>관리자 페이지</li>}
                    {/* <li onClick={getDisableUser}>ss</li> */}
                </ul>
                </div>
            </div>
            )}  
            <Outlet context={{isPublicCloud:isPublicCloud}}/>
      </div>
    )
}

export default SideBar;