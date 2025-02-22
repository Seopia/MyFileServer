import './Login.css';
import React, { useEffect, useState } from 'react';
import {  useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUser } from '../../reducer/UserDataSlice';
import api from '../../common/api';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const locationMessage = location.state?.message;
  const [message,setMessage] = useState('');
  const [id,setId] = useState('');
  const [pw, setPw] = useState('');

  const login = async (e) => {    
    if(e.key === 'Enter' || e.type === 'submit'){
        try{
            const response = await api.post('/login', {username:id,password:pw});            
            localStorage.setItem('token', response.headers.get("Authorization"));
            dispatch(getUser());
            navigate('/main');
        }catch(err){
            setMessage(err.response.data.error);
            
        }
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
  return (
    <div className='login-container'>
        <form className="login-input-container" onSubmit={(e)=>{
          e.preventDefault();
          login(e);
        }}>
          <div className="login-input">
            <div className="login-input-text">Login{message? <div className='login-server-message'>{message}</div> :<></>}</div>
            <input autoComplete='username' className="login-id" placeholder="아이디" value={id} onChange={(e)=>setId(e.target.value)}/>
            <input autoComplete='current-password' className="login-pw" placeholder="비밀번호" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} onKeyDown={(e)=>login(e)}/>
            <button type='submit' className="login-button">로그인</button>
            <button onClick={()=>navigate('/join')} className="login-button">회원 가입 신청</button>
            <div className='find-account-container'>
              <button className='login-tutorial' onClick={()=>navigate('/tutorial')} type='button'>여기는 어떤 웹사이트인가요?</button>
            </div>
          </div>
        </form>
      </div>
  );
}

export default Login;