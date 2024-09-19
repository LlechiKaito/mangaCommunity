import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Header, { getLocalStorage } from '../shared/Header.tsx';

const ForgetLoginId: React.FC = () => {
    const [emailAddress, setEmailAddress] = useState<string>('');
    const [error, setError] = useState<string>('')

    const navigate = useNavigate();

    const ForgetLoginIdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url: string = "/api/users/forget/login_id";
        const redirectUrl: string = "/users/after-send-email";

        try {
          await axios.post(url, {
            email_address: emailAddress
          });
          navigate(redirectUrl);
        } catch (error) {
          setError(error.response.data.error)
          console.error('Error fetching data:', error.response.data.error);
        }
    }
  
  return (
    <div>
      <Header />
      <h1>ログインID忘れ</h1>
      <form onSubmit={ForgetLoginIdSubmit}>
        <input 
          type="text" 
          placeholder='メールアドレス' 
          name={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
        <button type="submit">送信</button>
      </form>
      <p>{error}</p>
    </div>
  );
}

export default ForgetLoginId;
