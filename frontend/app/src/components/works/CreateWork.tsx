import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

type Tag = {
  tag_name: string;
};

const Creatework: React.FC = () => {
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [workImage, setWorkImage] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/works/create'); // タグの一覧を取得
      setTags(response.data); // 取得したタグの一覧をstateにセット
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('./create', {
        explanation: explanation,
        title: title,
        work_image: workImage,
        tags: selectedTags, // 複数のタグを送信
      });
      console.log('Work created:', response.data);
      navigate('/works');
    } catch (error) {
      console.error('Error creating work:', error);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
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
            type="text"
            id="workImage"
            value={workImage}
            onChange={(e) => setWorkImage(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tag">Tag:</label>
          <select
            id="tag"
            multiple
            value={selectedTags}
            onChange={handleTagChange}
          >
            {tags.map((tag, index) => (
              <option key={index} value={tag.tag_name}>{tag.tag_name}</option>
            ))}
          </select>
        </div>
        <button type="submit">Create Work</button>
      </form>
    </div>
  );
};

export default Creatework;