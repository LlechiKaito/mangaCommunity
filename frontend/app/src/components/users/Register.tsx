import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Header, { getLocalStorage } from '.././shared/Header.tsx';

const Register: React.FC = () => {

  const [loginId, setLoginId] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errors, setErrors] = useState<string[]>()

  const navigate = useNavigate();

  const RegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url: string = "/api/users/register";

    try {
      await axios.post(url, {
        login_id: loginId,
        email_address: emailAddress,
        password: password,
        password_confirmation: passwordConfirmation,
        name: name,
      });
      navigate('/users/login');
    } catch (error) {
      const tempErrors = () => {
        return error.response.data.errors.map((error) => error.msg);
      };
      setErrors(tempErrors)
      console.error('Error fetching data:', errors);
    }
  }

  return (
    <div>
      <Header />
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
      {errors?.map((error) => (
        <p>{error}</p>
      ))}
    </div>
  );
}

export default Register;