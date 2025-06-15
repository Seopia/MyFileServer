import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import api from "../common/api";
import s from './UserPage.module.css';
import { useSelector } from "react-redux";

function UserPage() {
    
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
      const handleLogout = () => {
    localStorage.removeItem("token")
    nav("/")
  }

  const handleEditStart = () => {
    window.scrollTo(0 , 0);
    setIsEdit(true)
    setPrevUser(user)
  }

  const handleEditComplete = () => {
    setIsEdit(false)
    updateUser()
  }

  const handleEditCancel = () => {
    setIsEdit(false)
    setUser(prevUser)
  }

  const handleProfileImageError = () => {
    handleUserChange({ profileImage: "/icon.png" })
  }
    const isMe = () => data.userCode === user.userCode;
    useEffect(()=>{getUser()},[getUser]);
  return (
    <div className={s.container}>
      {user && data ? (
        <div className={s.myPageContainer}>
          {/* Profile Section */}
          <div className={s.profileSection}>
            <div className={s.profileImageContainer}>
              <img
                className={s.profileImage}
                src={user.profileImage || "/placeholder.svg"}
                onError={handleProfileImageError}
                alt="프로필 이미지"
              />
              {/* <div className={s.profileImageOverlay}>
                <span className={s.cameraIcon}>📷</span>
              </div> */}
            </div>

            <div className={s.userInfo}>
              <div className={s.userNameSection}>
                {isEdit ? (
                  <input
                    className={s.userNameInput}
                    onChange={(e) => handleUserChange({ userId: e.target.value })}
                    value={user.userId}
                    placeholder="사용자명"
                  />
                ) : (
                  <h2 className={s.userName}>
                    <span className={s.userIcon}>👤</span>
                    {user.userId}
                  </h2>
                )}
              </div>

              <div className={s.introduceSection}>
                {isEdit ? (
                  <input
                    className={s.introduceInput}
                    placeholder="자기소개를 입력해주세요."
                    onChange={(e) => handleUserChange({ introduce: e.target.value })}
                    value={user.introduce ? user.introduce : ""}
                  />
                ) : (
                  <p className={s.introduce}>
                    <span className={s.introduceIcon}>💭</span>
                    {user.introduce ? user.introduce : "자기소개가 없습니다."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className={s.activitySection}>
            <h3 className={s.sectionTitle}>
              <span className={s.activityIcon}>📊</span>
              {isMe() ? "내" : ""} 활동
            </h3>
            <div className={s.activityCards}>
              <div className={s.activityCard}>
                <div className={s.cardIcon}>📝</div>
                <h4 className={s.cardTitle}>공용 파일 개수</h4>
                <p className={s.cardValue}>{user.uploadPublicFileCount}개</p>
              </div>
              <div className={s.activityCard}>
                <div className={s.cardIcon}>💬</div>
                <h4 className={s.cardTitle}>댓글</h4>
                <p className={s.cardValue}>{user.writtenCommentCount}개</p>
              </div>
              <div className={s.activityCard}>
                <div className={s.cardIcon}>📁</div>
                <h4 className={s.cardTitle}>개인 파일 개수</h4>
                <p className={s.cardValue}>{user.uploadFileCount}개</p>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          {(isMe() || data.userRole === "ROLE_ADMIN") && (
            <div className={s.settingsSection}>
              <h3 className={s.sectionTitle}>
                <span className={s.settingsIcon}>⚙️</span>
                설정
              </h3>
              <div className={s.settingsButtons}>
                {isEdit ? (
                  <>
                    <button onClick={handleEditComplete} className={s.primaryButton}>
                      <span className={s.buttonIcon}>✅</span>
                      설정 완료
                    </button>
                    <button onClick={handleEditCancel} className={s.secondaryButton}>
                      <span className={s.buttonIcon}>❌</span>
                      변경 취소
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleEditStart} className={s.primaryButton}>
                      <span className={s.buttonIcon}>✏️</span>
                      계정 설정
                    </button>
                    <button onClick={handleLogout} className={s.logoutButton}>
                      <span className={s.buttonIcon}>🚪</span>
                      로그아웃
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={s.errorContainer}>
          <div className={s.errorIcon}>😕</div>
          <div className={s.errorMessage}>유저가 없습니다.</div>
        </div>
      )}
    </div>
  )
}

export default UserPage