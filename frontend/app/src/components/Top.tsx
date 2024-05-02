import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';
import { useNavigate } from 'react-router-dom';

const Top: React.FC = () => {

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
      console.error(error);
    }
    
  }

  const AuthenticationComponent = () => {
    if (localStorage.getItem('user_id')){
      return (
        <div>
          <button onClick={onLogout}>ログアウト</button>
          <div>{localStorage.getItem("name")}でログインしています。</div>
        </div>
      );
    } else {
      return (
        <div>
          <a href="/users/login">ログイン</a>
          <a href="users/register">新規登録</a>
        </div>
      );
    }
  }

  return (
    <div className="App">
      <h1 className="bg-gray-300">Topページ</h1>
      <AuthenticationComponent />
    </div>
  );
}

export default Top;
