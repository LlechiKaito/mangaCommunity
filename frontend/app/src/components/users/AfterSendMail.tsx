import React, { useState } from 'react';
import '../../index.css';
import Header, { getLocalStorage } from '.././shared/Header.tsx';

const AfterSendEmail: React.FC = () => {

  return (
    <div className="App">
      <Header />
      <div>メールを送信しました。</div>
    </div>
  );
}

export default AfterSendEmail;
