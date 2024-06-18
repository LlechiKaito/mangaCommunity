import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { Link, useNavigate } from 'react-router-dom';

// localStorageに格納されている情報（user_id, nameなど）の取得
const getLocalStorage = (key: string) => {
  if (!key) {
    console.error("keyが空です。");
    return ;
  }

  const value = localStorage.getItem(key);

  if (!value) {
    console.error("localStorageにこのkeyは存在しません。");
    return ;
  }

  const item = JSON.parse(value);
  const nowTime: number = Date.now();

  if (item.expiry < nowTime) {
    localStorage.removeItem(key);
    console.error("このキーは有効期限が切れています。");
    return ;
  }
  return item.value;
}

// ログインしているかどうかの関数
const isLoggedIn = () => {
  let key: string = "user_id";
  const localUserId: number = getLocalStorage(key);
  if (localUserId) {
    return true;
  } else {
    return false;
  }
}

const Header: React.FC = () => {

  const navigate = useNavigate();

  const onLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    let url: string = "/users/logout";
    const afterUrl: string = window.location.pathname;

    try {
      await axios.post(url);
      localStorage.clear();
      navigate(afterUrl);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // セッションが無効な場合、localStorageをclearする
        localStorage.clear();
      } else {
        console.error('Error fetching data:', error);
      }
    }
    
  }

  let key: string = "user_id";
  const localUserId: number = getLocalStorage(key);
  key = "name";
  const localName: string = getLocalStorage(key);


  const AuthenticationComponent = () => {
    if (isLoggedIn()){
      return (
        <div>
          <button onClick={onLogout}>ログアウト</button>
          <div>{localName}でログインしています。</div>
          <Link to={`/users/${localUserId}`}>プロフィールへ</Link>
        </div>
      );
    } else {
      return (
        <div>
          <a href="/users/login">ログイン</a>
          <a href="/users/register">新規登録</a>
        </div>
      );
    }
  }

  return (
    <div className="App">
      <a href="/">トップページへ</a>
      <AuthenticationComponent />
      <a href="/works/result">検索画面へ</a>
    </div>
  );
}

export default Header;
export { getLocalStorage };