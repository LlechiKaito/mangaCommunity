import React, { useEffect, useState } from 'react';

export default function Login() {
    const url = "/users";
    const [users, setUsers] = useState([]);
  
    useEffect(() => {
      fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }, []);
  
    return (
      <div className="App">
        <h1>Users</h1>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
}