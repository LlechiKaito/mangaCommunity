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
    file_name:string;
  };
};

const AllWork: React.FC = () => {

    const [works, setWorks] = useState<Work[]>([]);  
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
    }

    return(
        <div>
            <h1>All Works</h1>
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
  