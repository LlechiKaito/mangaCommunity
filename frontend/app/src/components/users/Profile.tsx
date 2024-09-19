import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { Link, useNavigate } from 'react-router-dom';
import Top from '../Top.tsx';
import Header, { getLocalStorage } from '.././shared/Header.tsx';
import { useParams } from 'react-router-dom';
import AllBookMark from '../bookMarks/index.tsx';
import AllTag from '../tags/index.tsx';
import User from './Type.ts';

const Profile: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const [tagName, setTagName] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('')

  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      console.log(response)
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // ページがロードされたときにレコードを取得する

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`/api/users/${id}`, { tag_name: tagName });
      setTagName('');
    } catch (error) {
      setError(error.response.data.error)
      console.error('Error fetching data:', error.response.data.error);
    }
  };

  return (
    <div className="App">
      <Header />
      <h1 className="bg-gray-300">Profileページ</h1>
      <p>{error}</p>
      <Link to={`/`}>Topへ</Link>

      {/* ユーザー情報が存在する場合、nameを表示 */}
      {user && <h2>{user.name}さんのプロフィール</h2>}

      {/* authority_idが1の場合のみタグを作成フォームを表示 */}
      {user && user.authority_id === 1 && (
        <AllTag />
      )}
      <AllBookMark />
    </div>
  );
}

export default Profile;
