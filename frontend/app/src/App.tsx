import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/users/Login.tsx';
import Register from './components/users/Register.tsx';
import Profile from './components/users/Profile.tsx';
import Top from './components/Top.tsx';
import AllWork from './components/works/index.tsx';
import CreateWork from './components/works/create.tsx';
import ShowWork from './components/works/show.tsx';
import ForgetLoginId from './components/users/ForgetLoginId.tsx';
import ForgetPassword from './components/users/ForgetPassword.tsx';
import AfterSendEmail from './components/users/AfterSendMail.tsx';
import ResetPassword from './components/users/ResetPassword.tsx';
import AllBookMark from './components/bookMarks/index.tsx';
import AllTag from './components/tags/index.tsx';
import CreateTag from './components/tags/create.tsx';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top/>} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/forget/login_id" element={<ForgetLoginId />} />
        <Route path="/users/forget/password" element={<ForgetPassword />} />
        <Route path="/users/after-send-email" element={<AfterSendEmail />} />
        <Route path="/users/reset-password" element={<ResetPassword />} />
        <Route path="/users/register" element={<Register />} />
        <Route path="/works" element={<AllWork />} />
        <Route path="/works/create" element={<CreateWork />} />
        <Route path='/works/:id' element={<ShowWork />} />
        <Route path="/users/:id" element={<Profile />} />
        <Route path="/book_marks" element={<AllBookMark />} />
        <Route path="/tags" element={<AllTag />} />
        <Route path="/tags/create" element={<CreateTag />} />
      </Routes>
    </BrowserRouter>
  );
}
