import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express'; // Import types
import { createUser, forgetLoginId, forgetPassword, getUsers, loginUser, logoutUser, resetPassword, getUserProfile } from './controllers/UserController';
import { createWork, getWorks, showWork, deleteWork, updateWork } from './controllers/WorkController';
import { doBookMark, undoBookMark } from './controllers/BookMarkController';
import { createTag, getTags } from './controllers/TagController';
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
//work関係のルーティング
app.get('/works', getWorks);
app.post('/works/create', createWork);
app.get('/works/create', getTags);
app.get('/works/:id', showWork);
app.delete('/works/:id', (req, res, next) => {
    if (req.query.action === 'undoBookmark') {
        undoBookMark(req, res);
    } else {
        deleteWork(req, res);
    }
});
app.put('/works/:id',updateWork);

//bookmarkのルーティング
app.post('/works/:id', doBookMark);

app.post('/users/forget/login_id', forgetLoginId);
app.post('/users/forget/password', forgetPassword);
app.put('/users/reset-password', resetPassword);
app.get('/users/:id', getUserProfile);
//Tagのルーティング
app.post('/users/:id', createTag);

// 新しい /tags エンドポイントを追加
app.get('/tags', async (req: Request, res: Response) => {
    try {
      const tags = await prisma.tag.findMany();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).send('Internal Server Error');
    }
  });
  

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
