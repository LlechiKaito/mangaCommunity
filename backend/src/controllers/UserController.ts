import express from 'express';
import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import session, { SessionData }from 'express-session';

//sessionにおいてuserIdを定義
declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}
const app = express();
const prisma = new PrismaClient();

console.log('Session middleware initialized');

app.use(session({
    secret: 'manga',
    resave: false,
    saveUninitialized:false,
    cookie: { maxAge: 60 * 60 * 1000,
              secure: true,
    },
}));

app.use(express.json());

// 全表示
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                authority: true,
            },
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
};

// ユーザー作成機能(メール認証は行なっていない。)
export const createUser = async (req: Request, res: Response) => {
    try {
        // バリデーションのルールを定義
        await body('login_id')
            .notEmpty().withMessage('ログインIDは必須です。')
            .isString().withMessage('ログインIDは文字列である必要があります。')
            .custom(async (value) => {
                const existing_login_user = await prisma.user.findUnique({ where: { login_id: value } });
                if (existing_login_user) {
                    return Promise.reject('このログインIDは既に使用されています。');
                }
                return true;
            }).run(req);

        await body('email_address')
            .notEmpty().withMessage('メールアドレスは必須です。')
            .isEmail().withMessage('このメールアドレスはメールアドレスの形式ではありません。')
            .isString().withMessage('メールアドレスは文字列である必要があります。')
            .custom(async (value) => {
                const existing_email_user = await prisma.user.findUnique({ where: { email_address: value } });
                if (existing_email_user) {
                    return Promise.reject('このメールアドレスは既に登録されています。');
                }
                return true;
            }).run(req);

        await body('password')
            .notEmpty().withMessage('パスワードは必須です。')
            .isString().withMessage('パスワードは文字列である必要があります。')
            .isLength({ min: 8, max: 64 }).withMessage('パスワードは8文字以上64文字以下で設定してください')
            .custom((value) => {
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return Promise.reject('パスワードは半角大文字、小文字、数字をそれぞれ1つ以上含む必要があります。');
                }
                return true;
            })
            .run(req);

        await body('password_confirmation')
            .custom((value, { req }) => {
                if(value !== req.body.password) {
                    return Promise.reject('パスワードと確認用パスワードが一致しません。');
                }
                return true;
            })
            .run(req);

        await body('name')
            .notEmpty().withMessage('名前は必須です。')
            .isString().withMessage('名前は文字列である必要があります。')
            .isLength({ min: 1, max: 50 }).withMessage('名前は1文字以上50文字以下で設定してください。')
            .run(req);
            
        // バリデーションの結果をチェック
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            console.log(req.body)
            return res.status(400).json({ errors: errors.array(), users: req.body });
        }

        const login_id: string = req.body.login_id;
        const email_address: string = req.body.email_address;
        const saltRounds: number = 10;
        const password = req.body.password;
        const hashed_password: string = await bcrypt.hash(password, saltRounds);
        const name: string = req.body.name; 
        const authority_id: number = 2;
        const user = await prisma.user.create({
            data: {
                login_id: login_id,
                email_address: email_address,
                password: hashed_password,
                name: name,
                authority_id: authority_id
            },
        })
        res.status(201).json(user);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
};

export const loginUser = async (req: express.Request, res: express.Response) => {
    try {
        const login_id: string = req.body.login_id;
        const password: string = req.body.password;

        const saltRounds: number = 10;
        const hashed_password: string = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.findUnique({
            where: {
                login_id: login_id,
            },
        });

        if (!user){
            res.status(401).json({ error_message: "このユーザーIDは存在しません。" });
            return;
        }

        if (bcrypt.compareSync(password, user.password)){
            //ログイン成功時にセッションにユーザーidを保存する
            req.session!.userId = user.id;

            res.status(200).json(user);
        } else {
            res.status(401).json({ error_password: "このユーザーIDのパスワードが間違えています。", user: user });
        }
    } catch (error) {
        console.log(req.session)
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}