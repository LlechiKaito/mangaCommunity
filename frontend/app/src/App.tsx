import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/users/Login.tsx';
import Register from './components/users/Register.tsx';
import Profile from './components/users/Profile.tsx';
import Top from './components/Top.tsx';
import ForgetLoginId from './components/users/ForgetLoginId.tsx';
import ForgetPassword from './components/users/ForgetPassword.tsx';
import ResetPassword from './components/users/ResetPassword.tsx';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top/>} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/forget/email" element={<ForgetLoginId />} />
        <Route path="/users/forget/password" element={<ForgetPassword />} />
        <Route path="/users/reset-password" element={<ResetPassword />} />
        <Route path="/users/register" element={<Register />} />
        <Route path="/users/:id" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
