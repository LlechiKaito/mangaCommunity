import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { Navigate, useParams, useNavigate } from 'react-router-dom';

type Work = {
  id: string;
  explanation: string;
  title: string;
};

type WorkImage = {
  file_name: string; 
}

const Showwork: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  //ここから
  const [work, setWork] = useState<Work | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const [workImage, setWorkImage] = useState<WorkImage | null>(null);
  const [file_name, setFile_name] = useState<string>(' ');
  //ここまで重要（https://qiita.com/seira/items/f063e262b1d57d7e78b4)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await axios.get(`/works/${id}`);

        setWork(response.data.work); //res.json({work, work_image});という返り値を振り分ける
        setWorkImage(response.data.work_image); 

      } catch (error) {
        console.error('Error fetching work:', error);
      }
    };

    fetchWork();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/works/${id}`);
      navigate('/works');
    } catch (error) {
      console.error('Error deleting work:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/works/${id}`, { explanation, title, file_name: workImage?.file_name }); // 更新データを送信
      navigate('/works');
    } catch(error) {
      console.error('Error updating work:', error)
    }
  };

  return (
    <div>
      {work ? (
        <div>
          <h2>{work.title}</h2>
          <p>{work.explanation}</p>
          {workImage ? (
            <img src={workImage.file_name} alt="Work Image" />
          ) : (
            <p>No image available</p>
          )}
          <button onClick={handleDelete}>Delete Work</button>

          <h1>Update Work</h1>
          <form onSubmit={handleUpdate}>
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
              <label htmlFor="workimage">Workimage:</label>
              <input
                type="text"
                id="workimage"
                value={file_name}
                onChange={(e) => setFile_name(e.target.value)}
              />
            </div>
            
            <button type="submit">Update Work</button>
          </form>
        </div>
      ) : (
        <p>Loading...</p>
      )}


    </div>

  );
};
export default Showwork;
