import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/users/Login.tsx';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
