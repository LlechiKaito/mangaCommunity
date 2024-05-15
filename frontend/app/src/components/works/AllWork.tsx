import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';


const Allwork: React.FC = () => {

  const [works, setWorks] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorks();
  }, []); //ページがロードされたときにレコードを取得する

  const fetchWorks = async () => {
    try {
      const response = await axios.get("/works");
      setWorks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderWorks = () => {
    if (!Array.isArray(works)) {
      return null;
    }

    return works.map((work: any, index: number) => (
      <li key={index}>
        <h3>{work.title}</h3>
        <p>{work.explanation}</p>
        {work.work_image ? (
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
      <button onClick={() => navigate('./create')}>Create New Work</button>
      <ul>
        {renderWorks()}
      </ul>
    </div>
  );
}

export default Allwork;
