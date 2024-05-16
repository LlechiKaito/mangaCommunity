import express from 'express';
import { Express, Request, Response } from 'express'; // Import types
import { createUser, forgetLoginId, forgetPassword, getUsers, loginUser, logoutUser, resetPassword } from './controllers/UserController';
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
    cookie: {
    //     下記がエラーの原因だがわからん
    //     secure: true, // HTTPSを使用する
    //     httpOnly: true, // XSS攻撃を防ぐ
    //     sameSite: 'strict', // CSRF攻撃を防ぐ
        maxAge: 2 * 60 * 60 * 1000 // セッションの有効期限を設定（例: 2時間）
    }
}));

// user関係のルーティング
app.get('/users', getUsers);
app.post('/users/register', createUser);
app.post('/users/login', loginUser);
app.post('/users/logout', logoutUser);
app.post('/users/forget/login_id', forgetLoginId);
app.post('/users/forget/password', forgetPassword);
app.put('/users/reset-password', resetPassword);

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
