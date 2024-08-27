import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Header, { getLocalStorage } from '.././shared/Header.tsx';

const Login: React.FC = () => {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  const LoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url: string = "/users/login";
    const redirectUrl: string = "/";
    const userIdKey: string = "user_id";
    const nameKey: string = "name";
    const tokenKey: string = "token";
    const expireTime: number = Date.now() + 2 * 60 * 60 * 1000; //二時間の期限

    try {
      await axios.post(url, {
        login_id: loginId,
        password: password,
      })
      .then((response) => {
        const userItem = {
          value: response.data.user.id,
          expiry: expireTime
        }
        const nameItem = {
          value: response.data.user.name,
          expiry: expireTime
        }
        const tokenItem = {
          value: response.data.token,
          expiry: expireTime
        }
        localStorage.setItem(userIdKey, JSON.stringify(userItem));
        localStorage.setItem(nameKey, JSON.stringify(nameItem));
        localStorage.setItem(tokenKey, JSON.stringify(tokenItem));
        navigate(redirectUrl);
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // セッションが無効な場合、localStorageをclearする
        localStorage.clear();
      } else {
        console.error('Error fetching data:', error);
      }
    }
  }
  
  return (
    <div>
      <Header />
      <h1>ログイン</h1>
      <form onSubmit={LoginSubmit}>
        <input 
          type="text" 
          placeholder='ログインID' 
          name={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <input
          type='text'
          placeholder='パスワード'
          name={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">登録</button>
      </form>
      <a href="/users/forget/login_id">ログインID忘れ</a><br />
      <a href="/users/forget/password">パスワード忘れ</a>
    </div>
  );
}

export default Login;
