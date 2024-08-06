import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../index.css";
import Header, { getLocalStorage } from "../shared/Header.tsx";
import CreateTag from "../tags/create.tsx";

type Tag = {
    id: number;
    tag_name: string;
};

const AllTag: React.FC = () => {
    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        fetchTags();
    }, []); //ページがロードされたときにレコードを取得する

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

    const TagDisplays = () => {
        if (tags !== undefined) {
            return (
                <div>
                    { tags.map((tag, index) => (
                        <div key={index}>{index + 1}. {tag.tag_name}</div>
                    )) }
                </div>
            );
        } else {
            return (
                <div>タグはないです。もしくはエラー</div>
            );
        }
    };

    return (
        <div>
            <Header />
            <h1>All Tags</h1>
            <TagDisplays />
            <a href="/tags/create">タグ作成</a>
        </div>
    );
};

export default AllTag;