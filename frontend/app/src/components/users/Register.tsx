import React, { useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

// interface User {
//   id: number;
//   name: string;
// }

const Register: React.FC = () => {
  // const [users, setUsers] = useState<User[]>([]);

  const [loginId, setLoginId] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [name, setName] = useState<string>('');

  const navigate = useNavigate();

  const RegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url: string = "/users/register";

    try {
      await axios.post(url, {
        login_id: loginId,
        email_address: emailAddress,
        password: password,
        password_confirmation: passwordConfirmation,
        name: name,
      })
      navigate('/users/login');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>アカウント作成</h1>
      <form onSubmit={RegisterSubmit}>
        <input 
          type="text" 
          placeholder='ログインID' 
          name={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <input 
          type="text" 
          placeholder='メールアドレス' 
          name={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
        <input
          type='text'
          placeholder='パスワード'
          name={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type='text'
          placeholder='確認パスワード'
          name={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
        <input
          type='text'
          placeholder='名前'
          name={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">登録</button>
      </form>
    </div>
  );
}

export default Register;