import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';


const Allwork: React.FC = () => {

    const [works, setWorks] = useState<any[]>([]);  
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
                        <p>{work.explanation}</p>j
                    </li>
                ))}
            </ul>
        </div>
    );
  }
  
  export default Allwork;
  