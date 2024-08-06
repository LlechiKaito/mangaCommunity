import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../index.css";
import Header, { getLocalStorage } from "../shared/Header.tsx";

type Tag = {
    id: number;
    tag_name: string;
};

const TagSelects: React.FC = () => {
    const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    const fetchTags = async () => {
        try {
            const response = await axios.get("/tags");
            setTags(response.data);
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
        fetchTags();
    }, []); //ページがロードされたときにレコードを取得する

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedTagNames(selectedOptions);
    }

    if (tags !== undefined) {
        return (
            <div>
                <select multiple value={selectedTagNames} onChange={handleSelectChange}>
                    { tags.map((tag, index) => (
                        <option key={index} value={tag.tag_name}>{tag.tag_name}</option>
                    )) }
                </select>
            </div>
        );
    } else {
        return (
            <div>タグはないです。もしくはエラー</div>
        );
    }
};

export default TagSelects;