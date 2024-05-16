import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';

const Allwork: React.FC = () => {
  const [works, setWorks] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorks();
  }, []); // ページがロードされたときにレコードを取得する

  const fetchWorks = async (searchParams = {}) => {
    try {
      const response = await axios.get("/works", { params: searchParams });
      setWorks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    const searchParams: any = {};
    if (title) searchParams.title = title;
    fetchWorks(searchParams);
  };

  const renderWorks = () => {
    return works.map((work, index) => (
      <li key={index}>
        <h3>{work.title}</h3>
        <p>{work.explanation}</p>
        {work.work_image && work.work_image.length > 0 ? (
          <img src={work.work_image[0].file_name} alt='Work Image' />
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
