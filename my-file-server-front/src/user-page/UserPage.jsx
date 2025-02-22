import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import api from "../common/api";
import s from './UserPage.module.css';
import { useSelector } from "react-redux";
import MobileHeader from "../main/Mobile/Component/MobileHeader";

function UserPage() {
    const isMobile = useOutletContext();
    
    const {id} = useParams();
    const nav = useNavigate();
    const {data} = useSelector((state)=>state.user);
    const [isEdit, setIsEdit] = useState(false);
    const [prevUser, setPrevUser] = useState({});
    const [user, setUser] = useState(null);
    
    const getUser = useCallback(async () => {      
        try{
          const res = await api.get(`/main/other-user/${id}`);
          typeof res.data === 'object'?setUser(res.data):setUser(null)
        } catch(e){setUser(null);}
    },[id]);

    const handleUserChange = (update) => {
        setUser((prev)=>({
            ...prev,
            ...update
        }))
    };
    const updateUser = () => user!==prevUser && api.post(`/main/user`,user);
    const isMe = () => data.userCode === user.userCode;
    useEffect(()=>{getUser()},[getUser]);
    return (
        <div className={s.container}>
          {isMobile&&<MobileHeader title='마이페이지'/>}
            {
            user&&data?
            <div className={s.myPageContainer}>
            <div className={s.profileSection}>
              <img className={s.profileImage} src={user.profileImage} onError={()=>handleUserChange({profileImage:'/icon.png'})} alt="Error" />
              <div className={s.userInfo}>
                {isEdit?<input onChange={(e)=>handleUserChange({userId:e.target.value})} value={user.userId}/>:<h2>{user.userId}</h2>}
                {isEdit?<input placeholder="실명을 기입해주세요." onChange={(e)=>handleUserChange({introduce:e.target.value})} value={user.introduce?user.introduce:''}/>:<p>{user.introduce ? user.introduce : '자기소개가 없습니다.'}</p>}
              </div>
            </div>
      
            <div className={s.activitySection}>
              <h3>{isMe()? "내":""} 활동</h3>
              <div className={s.activityCards}>
                <div className={s.activityCard}>
                  <h4>게시글</h4>
                  <p>{user.writtenPostCount}개</p>
                </div>
                <div className={s.activityCard}>
                  <h4>댓글</h4>
                  <p>{user.writtenCommentCount}개</p>
                </div>
                <div className={s.activityCard}>
                  <h4>파일 개수</h4>
                  <p>{user.uploadFileCount}</p>
                </div>
              </div>
            </div>
            {isMe()||data.userRole==='ROLE_ADMIN'?  // 내 마이페이지면?
            <div className={s.settingsSection}>
              <h3>설정</h3>
              {
              isEdit? //정보 수정 중일 때
              <button onClick={()=>{setIsEdit(false);updateUser();}} className={s.settingsButton}>설정 완료</button>
              : //아닐 때
              <button onClick={()=>{setIsEdit(true);setPrevUser(user);}} className={s.settingsButton}>계정 설정</button>
              }
              {
              isEdit? //계정 정보 수정 중일 때
              <button onClick={()=>{setIsEdit(false);setUser(prevUser);}} className={s.settingsButton}>변경 취소</button>
              : //아닐 때
              <button onClick={()=>{localStorage.removeItem('token');nav('/');}} className={s.settingsButton}>로그아웃</button>
              }
            </div> : <></>
            }
          </div>
            :
            <div>유저가 없습니다.</div>
            }
        </div>
    )
}

export default UserPage