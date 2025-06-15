import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import s from './SideBar.module.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../reducer/UserDataSlice';
import { loginUrl, mainUrl } from './url';
const SideBar = () => {

    const nav = useNavigate();
    const dispatch = useDispatch();
    const { data, state } = useSelector((state) => state.user);
    const [isOpen, setIsOpen] = useState(false);

    const location = useLocation();
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);
    const logout = () => {
        localStorage.removeItem('token');
        nav(loginUrl);
    }
    useEffect(() => {
        if (!data && state !== 'loading' && state !== 'success') {
            dispatch(getUser());
        }
    }, [data, dispatch, state])
    return (
        <>
            <button className={`${s.hamburger} ${isOpen ? s.open : ''}`} onClick={() => setIsOpen(p => !p)}>
                ☰
                <span>{isOpen ? 'Close':'Menu'}</span>
            </button>
            <nav className={`${s.sidebar} ${isOpen ? s.open : ''}`}>
                <div className={s.faker}></div>
                <div className={`${s.sidebarContainer} ${isOpen ? s.open : ''}`}>
                    <div onClick={() => nav(mainUrl)} className={s.title}><img alt='Error' style={{ marginRight: 20 }} width={50} src='/icon.png' />Seopia Cloud</div>
                    <div className={s.buttonContainer}>
                        {data ?
                            <>
                                <button onClick={logout} className={s.logout}>Logout</button>
                                <button onClick={() => nav(`/user/${data.userCode}`)} className={s.logout}>My Page</button>
                            </>
                            :
                            <button onClick={() => nav(loginUrl)} className={s.login}>Login</button>
                        }
                    </div>
                    <ul className={s.list}>
                        <li onClick={() => { nav(`/personal`) }}>개인 클라우드</li>
                        <li onClick={() => { nav(mainUrl) }}>공용 클라우드</li>
                        <li onClick={() => nav('group/select')}>그룹 클라우드 (임시 제거)</li>
                        {/* <li onClick={() => nav('/forum')}>자유 게시판</li> */}
                        {data && data.userRole === 'ROLE_ADMIN' && <li onClick={() => nav('/admin/user')}>관리자 페이지</li>}
                        {/* {data && data.userRole === 'ROLE_ADMIN'&&<li onClick={()=>nav('/t')}>테스트 페이지</li>} */}
                    </ul>
                </div>
            </nav>
            <Outlet context={false} />
        </>
    )
}

export default SideBar;