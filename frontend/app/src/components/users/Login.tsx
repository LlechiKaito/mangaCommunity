import React, { useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  const LoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url: string = "/users/login";

    try {
      await axios.post(url, {
        login_id: loginId,
        password: password,
      })
      .then((response) => {
        localStorage.setItem('user_id', response.data.id);
        navigate("/");
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <div>
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
    </div>
  );
}

export default Login;
