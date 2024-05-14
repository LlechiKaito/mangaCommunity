import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Header, { getLocalStorage } from '../shared/Header.tsx';

const ForgetLoginId: React.FC = () => {
    const [emailAddress, setEmailAddress] = useState<string>('');

    const navigate = useNavigate();

    const ForgetLoginIdSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const url: string = "/users/forget/login_id";
        const redirectUrl: string = "/users/login";

        try {
            useEffect(() => {
                const fetchData = async () => {
                  await axios.post(url, {
                    email_address: emailAddress,
                  });
                }
                fetchData;
                navigate(redirectUrl);
            }, []);
        } catch (error) {
            console.error(error);
        }
    }
  
  return (
    <div>
      <Header />
      <h1></h1>
      <form onSubmit={ForgetLoginIdSubmit}>
        <input 
          type="text" 
          placeholder='メールアドレス' 
          name={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
        <button type="submit">送信</button>
      </form>
    </div>
  );
}

export default ForgetLoginId;
