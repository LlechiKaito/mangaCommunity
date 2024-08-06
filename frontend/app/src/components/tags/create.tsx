import React, { useState } from 'react';
import axios from 'axios';
import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Header, { getLocalStorage } from '../shared/Header.tsx';

const CreateTag: React.FC = () => {
    const [tagName, setTagName] = useState<string>('');

    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const afterUrl: string = `/users/${getLocalStorage("user_id")}`;
        // リクエストヘッダーの設定
        const headers = {
            'authorization': `Bearer ${getLocalStorage('token')}`,
            'Content-Type': 'application/json',
            // 他に必要なヘッダーがあれば追加する
        };

        try {
            await axios.post('/tags', {
                headers,
                tag_name: tagName,
                user_id: getLocalStorage("user_id")
            });
            navigate(afterUrl);
        } catch(error) {
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
        <h1>Create Tag</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="tagName">tagName:</label>
                <input
                    type="text"
                    id="tagName"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                />
            </div>
            <button type="submit">Create Tag</button>
        </form>
        <a href="/">トップへ</a>
        </div>
    );
};
  
export default CreateTag;