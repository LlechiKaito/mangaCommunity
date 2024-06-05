import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express'; // Import types
import { createUser, forgetLoginId, forgetPassword, getUsers, loginUser, logoutUser, resetPassword, getUserProfile } from './controllers/UserController';
import { createWork, getWorks, showWork, deleteWork, updateWork } from './controllers/WorkController';
import { workImageUpload } from './controllers/ImageController';
import { doBookMark, undoBookMark } from './controllers/BookMarkController';
import { createTag, getTags, associateTagsWithWork } from './controllers/TagController';
import cors from "cors";
import { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import {randomBytes} from "crypto";
import session from 'express-session';
import Redis from 'ioredis';
// import connectRedis from 'connect-redis';
import RedisStore from 'connect-redis';

const app: Express = express();
// app.set("trust proxy", true);
const port = 8080;

const corsOptions: CorsOptions ={
    origin: "http://localhost:3000",
    credentials: true,
};

const prisma = new PrismaClient();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

declare module 'express-session' {
    interface SessionData {
        user_id: number;
        name: string;
        authority_id: number;
    }
}

const secretKey = randomBytes(32).toString('hex');

// RedisStore を初期化します
// const RedisStore = connectRedis(session);

// Redis クライアントを作成します
const redisClient = new Redis({
  host: "redis",
  port: 6379,
});

// Redis クライアントに接続します
redisClient.connect().catch(console.error);

// Redis ストアを作成します
const redisStore = new RedisStore({
  client: redisClient,
});

// セッションの設定
app.use(session({
    secret: process.env.SESSION_SECRET || secretKey,
    resave: false,
    saveUninitialized: false,
    store: redisStore,
    cookie: {
    //     下記がエラーの原因だがわからん
        secure: false, // HTTPSを使用する
        httpOnly: true, // XSS攻撃を防ぐ
        sameSite: 'strict', // CSRF攻撃を防ぐ
        maxAge: 2 * 60 * 60 * 1000 // セッションの有効期限を設定（例: 2時間）
    }
}));

// react側で画像を表示させるために必要なもの
app.use('/api/images', express.static('/backend/public/images'));

// user関係のルーティング
app.get('/users', getUsers);
app.post('/users/register', createUser);
app.post('/users/login', loginUser);
app.post('/users/logout', logoutUser);
app.post('/users/forget/login_id', forgetLoginId);
app.post('/users/forget/password', forgetPassword);
app.put('/users/reset-password', resetPassword);
app.get('/users/:id', getUserProfile);


//work関係のルーティング
app.get('/works', getWorks);
app.post('/works/create', workImageUpload.single('image'), createWork);
app.get('/works/create', getTags);
app.get('/works/:id', showWork);
app.delete('/works/:id', deleteWork);
app.put('/works/:id', workImageUpload.single('image'), updateWork);

//bookmarkのルーティング
app.post('/book_marks/:id', doBookMark);
app.delete('/book_marks/:id', undoBookMark);


//Tagのルーティング
app.post('/users/:id', createTag);

// 新しい /tags エンドポイントを追加
// 一覧表示の表示に関してもcontroller側への記載をお願い致します。
// わかっていると思うけど、createのルーティング追加してください。
app.get('/tags', getTags);
app.post('/works/associate-tags', associateTagsWithWork);
  

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));