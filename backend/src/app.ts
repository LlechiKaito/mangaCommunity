import express from 'express';
import { Express, Request, Response } from 'express'; // Import types
import { createUser, getUsers, loginUser, logoutUser } from './controllers/UserController';
import cors from "cors";
import { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import {randomBytes} from "crypto";
import session from 'express-session';

const app: Express = express();
// app.set("trust proxy", true);
const port = 8080;

const corsOptions: CorsOptions ={
    origin: "http://localhost:3000",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

declare module 'express-session' {
    interface SessionData {
        user_id: number;
        name: string;
    }
}

const secretKey = randomBytes(32).toString('hex');

// セッションの設定
app.use(session({
    secret: process.env.SESSION_SECRET || secretKey,
    resave: false,
    saveUninitialized: true,
    // 下記がエラーの原因だがわからん
    // cookie: {
    //     secure: true, // HTTPSを使用する
    //     httpOnly: true, // XSS攻撃を防ぐ
    //     sameSite: 'strict', // CSRF攻撃を防ぐ
    //     maxAge: 60 * 60 * 1000 // セッションの有効期限を設定（例: 1時間）
    // }
}));

// user関係のルーティング
app.get('/users', getUsers);
app.post('/users/register', createUser);
app.post('/users/login', loginUser);
app.post('/users/logout', logoutUser);

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
