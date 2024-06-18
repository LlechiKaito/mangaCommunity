import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../index.css";
import { useNavigate } from "react-router-dom";
import Header, { getLocalStorage } from "../shared/Header.tsx";
import CreateBookmark from "../bookMarks/Create.tsx";

type Work = {
    id: number;
    explanation: string;
    user_id: number;
    title: string;
    work_image: {
        file_name: string;
    };
};

const AllWork: React.FC = () => {
    const [works, setWorks] = useState<Work[]>([]);
    const [hasBookMarks, setHasBookMarks] = useState<boolean[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorks();
    }, []); //ページがロードされたときにレコードを取得する

    const fetchWorks = async () => {
        try {
            const response = await axios.get("/works");
            setHasBookMarks(response.data.hasBookMarks);
            setWorks(response.data.works);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                // セッションが無効な場合、localStorageをclearする
                localStorage.clear();
            } else {
                console.error('Error fetching data:', error);
            }
        }
    };

    return (
        <div>
            <Header />
            <h1>All Works</h1>
            <button onClick={() => navigate("./create")}>Create New Work</button>
            <ul>
                {works.map((work, index) => (
                    <li key={index}>
                        <CreateBookmark id={work.id} isBookMark={hasBookMarks[index]} />
                        <h3>{work.title}</h3>
                        <p>{work.explanation}</p>
                        <p>{work.work_image.file_name}</p>
                        <img
                            src={`http://localhost:8080/api/images/works/${work.title}/${work.work_image.file_name}`}
                            alt="写真が読み込まれない"
                        />
                        <a href={`/works/${work.id}`}>詳細ページへ</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllWork;