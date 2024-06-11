import React, { useState } from 'react';
import '../index.css';
import Header, { getLocalStorage } from './shared/Header.tsx';

const Top: React.FC = () => {

  return (
    <div className="App">
      <Header />
      <h1 className="bg-gray-300">Topページ</h1>
      <a href="/works">作品一覧へ</a>
      <a href="/users">ユーザー一覧へ</a>
    </div>
  );
}

export default Top;
