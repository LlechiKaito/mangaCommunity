import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Header, { getLocalStorage } from '../shared/Header.tsx';
import TagSelects from '../tags/select.tsx';

type Tag = {
  id: number;
  tag_name: string;
};

const CreateWork: React.FC = () => {
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [workImage, setWorkImage] = useState<File>();
  const [tagNames, setTagNames] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("explanation", explanation);
      formData.append("title", title);
      formData.append("image", workImage as File);

      // リクエストヘッダーの設定
      const headers = {
        'authorization': `Bearer ${getLocalStorage('token')}`,
        'Content-Type': 'multipart/form-data'
        // 他に必要なヘッダーがあれば追加する
      };

      // エラー出たらヘッダー関係だと思う
      const response = await axios.post('./create', formData, {
        headers
      });
      console.log('Work created:', response.data);
      navigate('/works');
    } catch(error) {
      if (error.response && error.response.status === 403) {
        // セッションが無効な場合、localStorageをclearする
        localStorage.clear();
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setWorkImage(event.target.files[0]);
    }
  }
  
  return (
    <div>
      <Header />
      <h1>Create Work</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="explanation">Explanation:</label>
          <input
            type="text"
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            />
        </div>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="workImage">Work Image:</label>
          <input
            type="file"
            id="workImage"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <TagSelects />
        </div>
        <button type="submit">Create Work</button>
      </form>
      <a href="/">トップへ</a>
    </div>
  );
};
  
export default CreateWork;