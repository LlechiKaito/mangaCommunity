import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { Navigate, useParams, useNavigate } from 'react-router-dom';

type Work = {
  id: string;
  explanation: string;
  title: string;
  work_image: {
    file_name: string;
  };
};


const Showwork: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  //ここから
  const [work, setWork] = useState<Work | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [work_image, setWork_image] = useState<string>(' ');  
  //ここまで重要（https://qiita.com/seira/items/f063e262b1d57d7e78b4)

  const [isBookmarked, setIsBookmarked] = useState<boolean>(false); //未フォローorフォロー済みの管理

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await axios.get(`/works/${id}`);
        
        setWork(response.data.work);
        setIsBookmarked(response.data.isBookmarked);

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
      await axios.put(`/works/${id}`, { explanation, title, work_image}); // 更新データを送信
      navigate('/works');
    } catch (error) {
      console.error('Error updating work:', error)
    }
  };

  const doBookMark = async () => {
    try {
      setIsBookmarked(true);
      await axios.post(`/works/${id}`);
      navigate(`/works/${id}`);
    } catch (error) {
      console.error('Error doing Bookmark:', error)
    }
  };

  const undoBookMark = async () => {
    try {
      setIsBookmarked(false);
      await axios.delete(`/works/${id}?action=undoBookmark`);
      navigate(`/works/${id}`);
    } catch (error) {
      console.error('Error undoing Bookmark', error)
    }
  };

  const renderWorkImage = () => {
    if (work && work.work_image && work.work_image.file_name) {
      return <img src={work.work_image.file_name} alt='Work Image' />;
    } else {
      return <p>No image available</p>;
    }
  };

  return (
    <div>
      {work ? (
        <div>
          <h2>{work.title}</h2>
          <p>{work.explanation}</p>
          {renderWorkImage()}
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
                value={work_image}
                onChange={(e) => setWork_image(e.target.value)}
              />
            </div>

            <button type="submit">Update Work</button>
          </form>
          <button onClick={isBookmarked ? undoBookMark : doBookMark}>
            {isBookmarked ? "ブックマーク解除" : "ブックマークする"}
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}


    </div>

  );
};
export default Showwork;
