import React, { useEffect, useState } from 'react';
import '../index.css';

interface User {
  name: string;
  // Define other properties of user here if needed
}

const Top: React.FC = () => {
  const url = "/users";
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch(url, { method: "GET" })
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="App">
      <h1 className="bg-gray-300">Users</h1>
      <ul>
        {users.map((user: User, index: number) => (
          <li key={index}>{user.name}</li>
        ))}
      </ul>
      <div>{localStorage.getItem("user_id")}</div>
    </div>
  );
}

export default Top;
