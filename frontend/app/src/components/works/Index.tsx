import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

type Work = {
  id: string;
  explanation: string;
  user_id: number;
  title: string;
  work_image: {
    file_name: string;
  };
};

type Tag = {
  id: number;
  tag_name: string;
};

const AllWork: React.FC = () => {

  const [works, setWorks] = useState<Work[]>([]);
  const [title, setTitle] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorks();
    fetchTags();
  }, []); //ページがロードされたときにレコードを取得する

  const fetchWorks = async (searchParams = {}) => {
    try {
      const response = await axios.get("/works", { params: searchParams });
      setWorks(response.data);
    } catch (error) {
      console.error(error);
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

  const handleSearch = () => {
    const searchParams: any = {};
    if (title) searchParams.title = title;
    if (selectedTags.length > 0) searchParams.tag_names = selectedTags.join(',');
    fetchWorks(searchParams);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(selectedOptions);
  };

  

  return (
    <div>
      <h1>All Works</h1>
      <div>
        <input
          type="text"
          placeholder="Search by title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select multiple value={selectedTags} onChange={handleTagChange}>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.tag_name}>
              {tag.tag_name}
            </option>
          ))}
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>
      <button onClick={() => navigate('./create')}>Create New Work</button>
      <ul>
        {works.map((work, index) => (
          <li key={index}>
            <h3>{work.title}</h3>
            <p>{work.explanation}</p>
            <p>{work.work_image.file_name}</p>
            <img src={`http://localhost:8080/api/images/works/${work.title}/${work.work_image.file_name}`} alt="写真が読み込まれない" />
            <a href={`/works/${work.id}`}>詳細ページへ</a>
          </li>
        ))}
      </ul>
      <a href="/">トップへ</a>
    </div>
  );
}

export default AllWork;
