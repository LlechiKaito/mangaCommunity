import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../index.css";
import { useNavigate } from "react-router-dom";
import Header, { getLocalStorage } from "../shared/Header.tsx";
import CreateBookmark from "../bookMarks/create.tsx";

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
    const [searchTitle, setSearchTitle] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorks();
    }, []); //ページがロードされたときにレコードを取得する

    // リクエストヘッダーの設定
    const headers = {
        'authorization': `Bearer ${getLocalStorage('token')}`,
        'Content-Type': 'application/json',
        // 他に必要なヘッダーがあれば追加する
    };

    const handleSearch = () => {
        fetchWorks(searchTitle);
    };

    const fetchWorks = async (title = "") => {
        try {
            const response = await axios.get(`/works?title=${encodeURIComponent(title)}`, { headers });
            setHasBookMarks(response.data.hasBookMarks);
            setWorks(response.data.works);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                localStorage.clear();
            } else {
                console.error('データの取得中にエラーが発生しました:', error);
            }
        }
    };

    return (
        <div>
            <Header />
            <h1>All Works</h1>
            <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="タイトルで検索"
            />
            <button onClick={handleSearch}>検索</button>
            <button onClick={() => navigate("./create")}>新しい作品を作成</button>
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