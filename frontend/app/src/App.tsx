import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/users/Login.tsx';
import Register from './components/users/Register.tsx';
import Profile from './components/users/Profile.tsx';
import Top from './components/Top.tsx';
import AllWork from './components/works/Index.tsx';
import CreateWork from './components/works/Create.tsx';
import ShowWork from './components/works/Show.tsx';
import ForgetLoginId from './components/users/ForgetLoginId.tsx';
import ForgetPassword from './components/users/ForgetPassword.tsx';
import AfterSendEmail from './components/users/AfterSendMail.tsx';
import ResetPassword from './components/users/ResetPassword.tsx';
import AllBookMark from './components/bookMarks/Index.tsx';
import SearchTop from './components/searches/Index.tsx';

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
        <Route path="/works/result" element={<SearchTop />} />
      </Routes>
    </BrowserRouter>
  );
}
