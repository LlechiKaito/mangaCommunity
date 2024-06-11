import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../index.css';
import Header from '../shared/Header.tsx';

type Authority = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    authority: Authority;
};

const Index: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (user_name?: string) => {
        try {
            const response = await axios.get('/users/result', {
                params: { user_name }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('ユーザー情報の取得に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        fetchUsers(searchTerm);
    };

    if (loading) {
        return <div>読み込み中...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Header />
            <h1>ユーザー一覧</h1>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="ユーザー名で検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">検索</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>名前</th>
                        <th>メール</th>
                        <th>権限</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.authority.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Index;
