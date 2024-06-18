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

type Tag = {
    id: number;
    tag_name: string;
};

type Params = {
    title: string;
    tag_names: string[];
};
  
const SearchTop: React.FC = () => {
    const [works, setWorks] = useState<Work[]>([]);
    const [title, setTitle] = useState<string>("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchParams, setSearchParams] = useState<Params>();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTags();
    }, []); //ページがロードされたときにレコードを取得する

    const searchWorks = async (searchParams = {}) => {
        try {
            const response = await axios.get("/works/result", { params: searchParams });
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const tempParams: Params = {
            title: "",
            tag_names: []
        };
        if (title) tempParams.title = title;
        if (selectedTags.length > 0) tempParams.tag_names.push(selectedTags.join(','));
        setSearchParams(tempParams);
        searchWorks(searchParams);
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedTags(selectedOptions);
    };

    return (
        <div>
            <h1>Search Works or Users</h1>
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
};

export default SearchTop;