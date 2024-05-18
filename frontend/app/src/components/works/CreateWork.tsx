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
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // タグの一覧を取得する関数を呼び出す
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
        tag: selectedTag,
      });
      console.log('Work created:', response.data);
      navigate('/works');
    } catch (error) {
      console.error('Error creating work:', error);
    }
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
          <label htmlFor="Tag">Tag:</label>
          <select
            id="tag"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">Select a tag</option>
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
