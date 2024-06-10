import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate, useLocation } from 'react-router-dom';
import Header, { getLocalStorage } from '.././shared/Header.tsx';

const ResetPassword: React.FC =  () => {
    // ここからやる！
    const [password, setPassword] = useState<string>('');
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');

    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);

    const ForgetLoginIdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = query.get('token');

        const url: string = "/users/reset-password?token=" + token;
        const redirectUrl: string = "/users/login";

        try {
            await axios.put(url, {
                password: password,
                password_confirmation: passwordConfirmation
            });
            navigate(redirectUrl);
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
        <h1></h1>
        <form onSubmit={ForgetLoginIdSubmit}>
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
            <button type="submit">送信</button>
        </form>
        </div>
    );
}

export default ResetPassword;
