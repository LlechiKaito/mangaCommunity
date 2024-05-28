import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import CreateBookmark from '.././bookMarks/create.tsx';
import Header, { getLocalStorage } from '.././shared/Header.tsx';

type Work = {
  id: number;
  explanation: string;
  user_id: number;
  title: string;
  work_image: {
    file_name: string;
  };
};


const ShowWork: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  //ここから
  const [work, setWork] = useState<Work>();
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const [workImage, setWorkImage] = useState<File>();
  //ここまで重要（https://qiita.com/seira/items/f063e262b1d57d7e78b4)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await axios.get(`/works/${id}`);
        setWork(response.data.work); 
      } catch (error) {
        console.error('Error fetching work:', error);
      }
    };

    fetchWork();
  }, [id]);

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.delete(`/works/${id}`);
      navigate('/works');
    } catch (error) {
      console.error('Error deleting work:', error);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("explanation", explanation);
      formData.append("title", title);
      formData.append("image", workImage as File);

      await axios.put(`/works/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/works');
    } catch (error) {
      console.error('Error updating work:', error)
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
      {work ? (
        <div>
          <h2>{work.title}</h2>
          <p>{work.explanation}</p>
          <img src={`http://localhost:8080/public/images/works/${work.work_image.file_name}`} alt="noImage.jpeg" />
          <button onClick={handleDelete}>Delete Work</button>
          <CreateBookmark id={work.id} />
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
              {/* 編集に失敗してファイルをもう一度変更する際に保持したい */}
              <label htmlFor="workImage">Work Image:</label>
              <input
                type="file"
                id="workImage"
                onChange={handleFileChange}
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
export default ShowWork;
