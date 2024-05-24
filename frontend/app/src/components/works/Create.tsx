import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

type Tag = {
  id: number;
  tag_name: string;
};

const Creatework: React.FC = () => {
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [workImage, setWorkImage] = useState<File | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/tags'); // タグの一覧を取得
      setTags(response.data); // 取得したタグの一覧をstateにセット
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("explanation", explanation);
      formData.append("title", title);
      formData.append("image", workImage as File);
      selectedTags.forEach(tag => formData.append("tags[]", tag)); // Correct way to append tags

      const response = await axios.post('/works/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Work created:', response.data);
      navigate('/works');
    } catch (error) {
      console.error('Error creating work:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setWorkImage(event.target.files[0]);
    }
  };

  const handleTagChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedTags(selectedOptions);
  };

  return (
    <div>
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
          <label htmlFor="tags">Tags:</label>
          <select
            id="tags"
            multiple={true}
            value={selectedTags}
            onChange={handleTagChange}
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.tag_name}>{tag.tag_name}</option>
            ))}
          </select>
        </div>
        <button type="submit">Create Work</button>
      </form>
      <a href="/">トップへ</a>
    </div>
  );
};

export default Creatework;
