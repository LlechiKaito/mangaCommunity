import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { Link, useNavigate } from 'react-router-dom';
import Top from '../Top.tsx';
import Header, { getLocalStorage } from '.././shared/Header.tsx';
import { useParams } from 'react-router-dom';
import AllBookMark from '../bookMarks/Index.tsx';

type User = {
  name: string;
  authority_id: number;
}

const Profile: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const [tagName, setTagName] = useState<string>('');
  const [message, setMessage] = useState<string | null>('null');
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/users/${id}`);
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
      const response = await axios.post(`/users/${id}`, { tag_name: tagName });
      setMessage('タグが作成されました: ${response.data.tag_name}');
      setTagName('');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // セッションが無効な場合、localStorageをclearする
        localStorage.clear();
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };

  return (
    <div className="App">
      <Header />
      <h1 className="bg-gray-300">Profileページ</h1>
      <Link to={`/`}>Topへ</Link>

      {/* ユーザー情報が存在する場合、nameを表示 */}
      {user && <h2>{user.name}さんのプロフィール</h2>}

      {/* authority_idが1の場合のみタグを作成フォームを表示 */}
      {user && user.authority_id === 1 && (
        <div>
          <h2>タグを作成</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="タグ名を入力"
              required
            />
            <button type="submit">タグを作成</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      )}
      <AllBookMark />
    </div>
  );
}

export default Profile;
