import React, { useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Header, { getLocalStorage } from '.././shared/Header.tsx';

const CreateWork: React.FC = () => {
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [workImage,setWorkImage] = useState<File>();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("explanation", explanation);
      formData.append("title", title);
      formData.append("image", workImage as File);

      const response = await axios.post('./create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Work created:', response.data);
      navigate('/works');
    } catch(error) {
      console.error('Error creating work:', error);
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
        <button type="submit">Create Work</button>
      </form>
      <a href="/">トップへ</a>
    </div>
  );
};
  
export default CreateWork;