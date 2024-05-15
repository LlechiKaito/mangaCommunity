import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/users/Login.tsx';
import Register from './components/users/Register.tsx';
import Top from './components/Top.tsx';
import Allwork from './components/works/AllWork.tsx';
import Creatework from './components/works/CreateWork.tsx';
import Showwork from './components/works/ShowWork.tsx'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top/>} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/register" element={<Register />} />
        <Route path="/works" element={<Allwork />} />
        <Route path="/works/create" element={<Creatework />} />
        <Route path='/works/:id' element={<Showwork />} />
      </Routes>
    </BrowserRouter>
  );
}
