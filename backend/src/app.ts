import express from 'express';
import { Express, Request, Response } from 'express'; // Import types

import { createUser } from './controllers/users/CreateUser';
import { forgetLoginId } from './controllers/users/ForgetLoginId';
import { forgetPassword } from './controllers/users/ForgetPassword';
import { getUsers } from './controllers/users/GetUsers';
import { loginUser } from './controllers/users/LoginUser';
import { logoutUser } from './controllers/users/LogoutUser';
import { resetPassword } from './controllers/users/ResetPassword';
import { getUserProfile } from './controllers/users/GetUserProfile';

import { createWork, getWorks, showWork, deleteWork, updateWork } from './controllers/WorkController';
import { workImageUpload } from './controllers/ImageController';
import { doBookMark, undoBookMark, getBookMarks } from './controllers/BookMarkController';
import { createTag, getTags } from './controllers/TagController';
import cors from "cors";
import { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import {randomBytes} from "crypto";
import session from 'express-session';
import Redis from 'ioredis';
// import connectRedis from 'connect-redis';
import RedisStore from 'connect-redis';
import { getUsersBySearch, getWorksBySearch } from './controllers/SearchController';
import jwt from 'jsonwebtoken';

const app: Express = express();
// app.set("trust proxy", true);
const port = 8080;



// const corsOptions: CorsOptions ={
//     origin: "http://localhost:3000",
//     credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(cookieParser());

// declare module 'express-session' {
//     interface SessionData {
//         user_id: number;
//         name: string;
//         authority_id: number;
//     }
// }

const secretKey = randomBytes(32).toString('hex');

app.use(express.json());



// // RedisStore を初期化します
// // const RedisStore = connectRedis(session);

// // Redis クライアントを作成します
// const redisClient = new Redis({
//   host: "redis",
//   port: 6379,
// });

// // Redis クライアントに接続します
// redisClient.connect().catch(console.error);

// // Redis ストアを作成します
// const redisStore = new RedisStore({
//   client: redisClient,
// });

// // セッションの設定
// app.use(session({
//     secret: process.env.SESSION_SECRET || secretKey,
//     resave: false,
//     saveUninitialized: false,
//     store: redisStore,
//     cookie: {
//     //     下記がエラーの原因だがわからん
//         secure: false, // HTTPSを使用する
//         httpOnly: true, // XSS攻撃を防ぐ
//         sameSite: 'strict', // CSRF攻撃を防ぐ
//         maxAge: 7200000 // セッションの有効期限を設定（例: 2時間）
//     }
// }));

// react側で画像を表示させるために必要なもの
app.use('/api/images', express.static('/backend/public/images'));

// user関係のルーティング
app.post('/api/users/register', createUser);
app.post('/api/users/login', loginUser);
app.post('/api/users/logout', logoutUser);
app.post('/api/users/forget/login_id', forgetLoginId);
app.post('/api/users/forget/password', forgetPassword);
app.put('/api/users/reset-password', resetPassword);
app.get('/api/users/:id', getUserProfile);
app.get('/api/users/result', getUsersBySearch);

//work関係のルーティング
app.get('/works', getWorks);
app.get('/works/result', getWorksBySearch);
app.post('/works/create', workImageUpload.single('image'), createWork);
app.get('/works/create', getTags);
app.get('/works/:id', showWork);
app.delete('/works/:id', deleteWork);
app.put('/works/:id', workImageUpload.single('image'), updateWork);

//bookmarkのルーティング
app.get('/book_marks', getBookMarks);
app.post('/book_marks/:id', doBookMark);
app.delete('/book_marks/:id', undoBookMark);

//Tagのルーティング(保留)
app.post('/tags', createTag);

// 新しい /tags エンドポイントを追加(保留)
app.get('/tags', getTags);
// app.post('/works/associate-tags', associateTagsWithWork);

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));