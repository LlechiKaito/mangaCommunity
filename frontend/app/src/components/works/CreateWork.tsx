import React, { useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

const Creatework: React.FC = () => {
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [workImage,setWorkImage] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('./create', {
        explanation: explanation,
        title: title,
        work_image: workImage,
      });
      console.log('Work created:', response.data);
      navigate('/works');
    } catch(error) {
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
        <button type="submit">Create Work</button>
      </form>
    </div>
  );
};
  
  export default Creatework;
  