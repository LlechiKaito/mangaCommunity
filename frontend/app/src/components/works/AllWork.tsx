import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';


type Tag = {
  id: number;
  tag_name: string;
};

const Allwork: React.FC = () => {
  const [works, setWorks] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorks();
    fetchTags();
  }, []); // ページがロードされたときにレコードを取得する

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


  const renderWorks = () => {
    return works.map((work, index) => (
      <li key={index}>
        <h3>{work.title}</h3>
        <p>{work.explanation}</p>
        {work.work_image.file_name ? (
          <img src={work.work_image.file_name} alt='Work Image' />
        ) : (
          <p>No image available</p>
        )}
      </li>
    ));
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
        {renderWorks()}
      </ul>
    </div>
  );
}

export default Allwork;
