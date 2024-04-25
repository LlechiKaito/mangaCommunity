import express from 'express';
import { Express, Request, Response } from 'express'; // Import types
import { createUser, getUsers, loginUser } from './controllers/UserController';
import cors from "cors";
import { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

const app: Express = express();
const port = 8080;

const corsOptions: CorsOptions ={
    origin: "http://localhost:3000",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// user関係のルーティング
app.get('/users', getUsers);
app.post('/users/register', createUser);
app.post('/users/login', loginUser);

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
