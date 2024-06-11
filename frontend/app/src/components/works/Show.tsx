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
  work_tags: {
    tag: {
      tag_name: string;
    };
  }[];
};

type Tag = {
  id: number;
  tag_name: string;
};

const ShowWork: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  //ここから
  const [work, setWork] = useState<Work>();
  const [explanation, setExplanation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [workImage, setWorkImage] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await axios.get(`/works/${id}`);
        console.log('API Response:', response.data);
        const fetchedWork = response.data.work;
        setWork(fetchedWork);
        setExplanation(fetchedWork.explanation);
        setTitle(fetchedWork.title);
        setWorkImage(fetchedWork.work_image.file_name);
        setIsBookmarked(response.data.isBookmarked);
        if (fetchedWork.work_tags) {
          setSelectedTags(fetchedWork.work_tags.map((workTag: { tag: Tag }) => workTag.tag.tag_name));
        } else {
          setSelectedTags([]);
        }
      } catch (error) {
        console.error('Error fetching work:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get('/tags');
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchWork();
    fetchTags();
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
      if (workImage) formData.append("image", workImage as File);
      selectedTags.forEach(tag => formData.append("tags[]", tag));

      await axios.put(`/works/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Work updated:');
      navigate(`/works/${id}`);
    } catch (error) {
      console.error('Error updating work:', error)
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
      <Header />
      {work ? (
        <div>
          <h2>{work.title}</h2>
          <p>{work.explanation}</p>
          <img src={`http://localhost:8080/api/images/works/${work.title}/${work.work_image.file_name}`} alt="noImage.jpeg" />
          {selectedTags.length > 0 && (
            <div>
              <h3>Tags:</h3>
              <ul>
                {selectedTags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
              </ul>
            </div>
          )}
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

            <button type="submit">Update Work</button>
          </form>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <a href="/">トップへ</a>
    </div>
  );
};

export default ShowWork;
