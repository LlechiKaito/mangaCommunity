import React, { useState } from 'react';
import '../.././index.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getLocalStorage } from '../shared/Header.tsx';

// paramsからの取得の変更

const CreateBookmark: React.FC<{ id: number, isBookMark: boolean }> = ({ id, isBookMark }) => {
    const [workId, setWorkId] = useState<number>(id);
    const [isBookMarked, setIsBookMarked] = useState<boolean>(isBookMark);
    const navigate = useNavigate();

    if (!workId) {
        console.error("workIdが空です。");
        return ;
    }

    console.log(isBookMarked);

    const doBookMark = async (event: React.FormEvent) => {
        event.preventDefault();
        const afterUrl: string = window.location.pathname;
        // リクエストヘッダーの設定
        const headers = {
            'authorization': `Bearer ${getLocalStorage('token')}`,
            'Content-Type': 'application/json',
            // 他に必要なヘッダーがあれば追加する
        };

        const data = {};

        try {
            await axios.post(`/book_marks/${workId}`, data, {
                headers
            });
            setIsBookMarked(true)
            // isBookMark = true;
            navigate(afterUrl);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                // セッションが無効な場合、localStorageをclearする
                localStorage.clear();
            } else {
                console.error('Error fetching data:', error);
            }
        }
    };
    
    const undoBookMark = async (event: React.FormEvent) => {
        event.preventDefault();
        const afterUrl: string = window.location.pathname;

        // リクエストヘッダーの設定
        const headers = {
            'authorization': `Bearer ${getLocalStorage('token')}`,
            'Content-Type': 'application/json',
            // 他に必要なヘッダーがあれば追加する
        };

        const data = {};

        try {
            await axios.delete(`/book_marks/${workId}`, {headers});
            setIsBookMarked(false);
            navigate(afterUrl);
        } catch (error) {
            console.error('Error undoing Bookmark', error)
        }
    };

    const BookMarkComponent = () => {
        if (isBookMarked){
          return (
            <button onClick={undoBookMark}>
                {"ブックマーク解除"}
            </button>
          );
        } else {
            return (
                <button onClick={doBookMark}>
                    {"ブックマークする"}
                </button>
            );
        }
      }

    return (
        <BookMarkComponent />
    );
}

export default CreateBookmark;