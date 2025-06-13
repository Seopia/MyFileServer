import { useEffect, useState } from 'react';
import {  useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUser } from '../../reducer/UserDataSlice';
import api from '../../common/api';
import { mainUrl } from '../../common/url';
import s from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const locationMessage = location.state?.message;
  const [message,setMessage] = useState('');
  const [loginData, setLoginData] = useState({id:'', pw:''});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {    
        try{
            const response = await api.post('/login', {username:loginData.id,password:loginData.pw});            
            localStorage.setItem('token', response.headers.get("Authorization"));
            dispatch(getUser());
            navigate(mainUrl);
        }catch(err){
            setMessage(err.response.data.error);
            
        }
  }

  useEffect(() => {
    if(localStorage.getItem('token')){
        localStorage.removeItem('token');
    }
  }, [navigate]);
  useEffect(()=>{
    locationMessage && setMessage(locationMessage);
  },[locationMessage]);


  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const handleSubmit = (e) => {
    e.preventDefault()
    if (loginData.id && loginData.pw) {
      handleLogin()
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  const handleInputChange = (e) => {
    setLoginData(p=>({...p, [e.target.name]:e.target.value}));
  }

  return (
    <div className={s.loginContainer}>
      {/* 배경 장식 요소들 */}
      <div className={s.backgroundDecorations}>
        <div className={s.floatingShape1}></div>
        <div className={s.floatingShape2}></div>
        <div className={s.floatingShape3}></div>
        <div className={s.gradientOrb1}></div>
        <div className={s.gradientOrb2}></div>
      </div>

      {/* 메인 로그인 카드 */}
      <div className={s.loginCard}>
        {/* 헤더 */}
        <div className={s.loginHeader}>
          <div className={s.logoContainer}>
            <div className={s.logo}>
              <span className={s.logoIcon}>☁️</span>
              <span className={s.logoText}>Seopia Cloud</span>
            </div>
            <div className={s.logoSubtext}>안전한 클라우드 스토리지</div>
          </div>
        </div>

        {/* 로그인 폼 */}
        <form className={s.loginForm} onSubmit={handleSubmit}>
          <div className={s.welcomeText}>
            <h2 className={s.welcomeTitle}>환영합니다!</h2>
            <p className={s.welcomeSubtitle}>계정에 로그인하여 개인 파일에 액세스하세요</p>
          </div>

          {/* 아이디 입력 필드 */}
          <div className={s.inputGroup}>
            <label className={s.inputLabel} htmlFor="username">
              <span className={s.labelIcon}>👤</span>
              아이디
            </label>
            <div className={`${s.inputWrapper} ${focusedField === "username" ? s.focused : ""}`}>
              <span className={s.inputIcon}>📧</span>
              <input
                id="username"
                type="text"
                className={s.input}
                placeholder="아이디를 입력하세요"
                value={loginData.id || ""}
                name='id'
                onChange={handleInputChange}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField("")}
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className={s.inputGroup}>
            <label className={s.inputLabel} htmlFor="password">
              <span className={s.labelIcon}>🔒</span>
              비밀번호
            </label>
            <div className={`${s.inputWrapper} ${focusedField === "password" ? s.focused : ""}`}>
              <span className={s.inputIcon}>🔑</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={s.input}
                placeholder="비밀번호를 입력하세요"
                value={loginData.pw || ""}
                name='pw'
                onChange={handleInputChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                required
              />
              <button
                type="button"
                className={s.passwordToggle}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <span className={s.toggleIcon}>{showPassword ? "🙈" : "👁️"}</span>
              </button>
            </div>
          </div>

          {/* 추가 옵션 */}
          <div className={s.loginOptions}>
            <label className={s.checkboxContainer}>
              {/* <input type="checkbox" className={s.checkbox} /> */}
              {/* <span className={s.checkboxCustom}></span> */}
              {/* <span className={s.checkboxLabel}>로그인 상태 유지</span> */}
            </label>
            {/* <button type="button" className={s.forgotPassword}> */}
              {/* 비밀번호를 잊으셨나요? */}
            {/* </button> */}
          </div>

          {/* 로그인 버튼 */}
          <button type="submit" className={s.loginButton} disabled={isLoading}>
            {isLoading ? (
              <div className={s.loadingContainer}>
                <div className={s.spinner}></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              <>
                <span className={s.buttonIcon}>🚀</span>
                로그인
              </>
            )}
          </button>
          <button onClick={()=>navigate(mainUrl)} className={s.loginButton}><span className={s.buttonIcon}>🏠</span>홈으로</button>

          {/* 구분선 */}
          <div className={s.divider}>
            <span className={s.dividerText}>또는</span>
          </div>

          {/* 회원가입 버튼 */}
          <button type="button" className={s.signupButton} onClick={()=>navigate('/join')}>
            <span className={s.buttonIcon}>✨</span>새 계정 만들기
          </button>
        </form>

        {/* 소셜 로그인 (선택사항) */}
        {/* <div className={s.socialLogin}>
          <p className={s.socialText}>소셜 계정으로 빠른 로그인</p>
          <div className={s.socialButtons}>
            <button className={s.socialButton}>
              <span className={s.socialIcon}>🌐</span>
              Google
            </button>
            <button className={s.socialButton}>
              <span className={s.socialIcon}>📘</span>
              Facebook
            </button>
            <button className={s.socialButton}>
              <span className={s.socialIcon}>🐦</span>
              Twitter
            </button>
          </div>
        </div> */}

        {/* 푸터 */}
        <div className={s.loginFooter}>
          <p className={s.footerText}>
            계정이 없으신가요?{" "}
            <button className={s.footerLink} onClick={()=>navigate('/join')}>
              지금 가입하세요
            </button>
          </p>
        </div>
      </div>

      {/* 추가 정보 카드 */}
      <div className={s.infoCard}>
        <div className={s.infoContent}>
          <h3 className={s.infoTitle}>
            <span className={s.infoIcon}>🛡️</span>
            안전한 클라우드 스토리지
          </h3>
          <ul className={s.featureList}>
            <li className={s.featureItem}>
              <span className={s.featureIcon}>🔐</span>
              엔드투엔드 암호화
            </li>
            <li className={s.featureItem}>
              <span className={s.featureIcon}>⚡</span>
              무료
            </li>
            <li className={s.featureItem}>
              <span className={s.featureIcon}>📱</span>
              모든 기기에서 접근
            </li>
            <li className={s.featureItem}>
              <span className={s.featureIcon}>🌍</span>전 세계 어디서나
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login;