import React, { useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { Link, useNavigate } from 'react-router-dom';
import Top from '../Top.tsx';
import Header, { getLocalStorage } from '.././shared/Header.tsx';

const Profile: React.FC = () => {

  const navigate = useNavigate();

  return (
    <div className="App">
      <Header />
      <h1 className="bg-gray-300">Profileページ</h1>
      <Link to={`/`}>Topへ</Link>
    </div>
  );
}

export default Profile;
