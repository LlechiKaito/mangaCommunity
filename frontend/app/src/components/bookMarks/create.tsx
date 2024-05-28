import React, { useState } from 'react';
import '../.././index.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// paramsからの取得の変更

const CreateBookmark: React.FC<{ id: number }> = ({ id }) => {
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
    const [workId, setWorkId] = useState<number>(id);
    const navigate = useNavigate();

    if (!workId) {
        console.error("workIdが空です。");
        return ;
    }

    const doBookMark = async (event: React.FormEvent) => {
        event.preventDefault();
        const afterUrl: string = window.location.pathname;
        try {
            setIsBookmarked(true);
            await axios.post(`/book_marks/${workId}`);
            navigate(afterUrl);
        } catch (error) {
            console.error('Error doing Bookmark:', error)
        }
    };
    
    const undoBookMark = async (event: React.FormEvent) => {
        event.preventDefault();
        const afterUrl: string = window.location.pathname;
        try {
            setIsBookmarked(false);
            await axios.delete(`/book_marks/${workId}`);
            navigate(afterUrl);
        } catch (error) {
            console.error('Error undoing Bookmark', error)
        }
    };

    return (
        <button onClick={isBookmarked ? undoBookMark : doBookMark}>
            {isBookmarked ? "ブックマーク解除" : "ブックマークする"}
        </button>
    );
}

export default CreateBookmark;