import React, { useEffect, useState } from 'react';
import '../.././index.css';
import axios from 'axios';
import CreateBookmark from './Create.tsx';

type Work = {
    id: number;
    explanation: string;
    user_id: number;
    title: string;
    work_image: {
        file_name: string;
    };
};

const AllBookMark: React.FC = () => {
    const [works, setWorks] = useState<Work[]>([]);

    const fetchWorksWithBookMarks = async () => {
        try {
            const response = await axios.get("/book_marks");
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

    useEffect(() => {
        fetchWorksWithBookMarks();
    }, []); //ページがロードされたときにレコードを取得する

    return (
        <div>
            <h1>All Works With BookMarks</h1>
            <ul>
                {works.map((work, index) => (
                    <li key={index}>
                        <CreateBookmark id={work.id} isBookMark={true} />
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
}

export default AllBookMark;