import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

// const secretKey = randomBytes(32).toString('hex');
// セキュリティ的に変更する必要がある。
const secretKey = "manga";

// 本当はこれでprismaのものを代入しないといけん
interface User {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    login_id: string;
    email_address: string;
    password: string;
    name: string;
    authority_id: number;
    password_reset_token: string | null;
    password_reset_expires: Date | null;
}

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

// 全てのfalseをログインできていないことにしています。脆弱性
export const isLoggedIn = async(req: Request, res: Response) => {

    if (!req.headers['authorization'] || Array.isArray(req.headers['authorization'])){
        return false; 
    }

    const authHeader: string = req.headers['authorization'];

    const token: string = authHeader.split(' ')[1];

    try {
        const decodedToken = jwt.verify(token, secretKey) as { user_id: number; name: string; authority_id: number };
        return decodedToken;
    }catch{
        return false;
    }
}

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

export const loginUser = async (req: Request, res: Response) => {
    try {
        const login_id: string = req.body.login_id;
        const password: string = req.body.password;

        const user = await prisma.user.findUnique({
            where: {
                login_id: login_id,
            },
        });

        if (!user){
            res.status(400).json({ error: "このユーザーIDは存在しません。" });
            return;
        }

        const passwordIsValid = await bcrypt.compareSync(password, user.password)
        if (passwordIsValid){
            const token = await jwt.sign(
                { user_id: user.id as number, name: user.name as string, authority_id: user.authority_id as number },
                secretKey,
                { expiresIn: '2h' }
            );
            res.status(200).json({user, token});
        } else {
            res.status(400).json({ error_password: "このユーザーIDのパスワードが間違えています。", user: user });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        console.log(req.headers['authorization'])
        if (!req.headers['authorization'] || Array.isArray(req.headers['authorization'])){
            res.status(401).json({message: "トークンがありません。"})
            return; 
        }
        
        // ブラックリスト方式やリフレッシュトークンなどを導入してセキュリティを強固にする必要があるが、今は何もしない

        res.status(200).json({ message: "正常にログアウトしました。" });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}

export const forgetLoginId = async (req: Request, res: Response) => {
    try {
        // 以下のメールアドレスは、変える必要あり
        const from: string = "llechi0420@gmail.com";
        const to: string = req.body.email_address;

        const user = await prisma.user.findUnique({
            where: {
                email_address: to,
            },
        });

        if (!user){
            res.status(400).json({error: "このメールアドレスに一致するユーザーは存在しません。"});
            return;
        }

        const subject: string = "漫画コミュニティWEBサイトより -ログインIDのお知らせ-";
        // この内容に関して変える必要がある
        const content: string = `
            <p>日頃より漫画コミュニティをご利用頂き、誠にありがとうございます。</p>
            <p>漫画コミュニティ会員情報のログインIDをお知らせ致します。</p>
            <p>${user.login_id}</p>;
        `;

        // http://localhost:8025/ を入力することでメール送信されたかがわかる。
        // const smtp = nodemailer.createTransport({
        //     host: 'smtp.example.com', //実際のSMTPサーバーのホスト名に置き換える必要があります
        //     port: 587,//25の可能性もある
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: 'your_username',
        //         pass: 'your_password'//実際のユーザー名とパスワードに置き換える必要があります。
        //     }
        // });
        // この上のようにsmtpに設定しデプロイする必要があります。
        const smtp = nodemailer.createTransport({
            host: 'mailhog',
            port: 1025,
            auth: {
                user: 'user',
                pass: 'password'
            }
        });


        const option = {
            from: from, 
            to: to, 
            subject: subject, 
            html: content
        };


        await smtp.sendMail(option);

        res.status(200).json({
            message: "message has been sent",
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}

export const forgetPassword = async (req: Request, res: Response) => {
    try {
        // 以下のメールアドレスは、変える必要あり
        const from: string = "llechi0420@gmail.com";
        const to: string = req.body.email_address;

        const user = await prisma.user.findUnique({
            where: {
                email_address: to,
            },
        });

        if (!user){
            res.status(400).json({error: "このメールアドレスに一致するユーザーは存在しません。"});
            return;
        }

        const subject: string = "漫画コミュニティWEBサイトより -パスワード変更のお知らせ-";
        if (process.env.JWT_SECRET) {
            const jwt_secret: string = process.env.JWT_SECRET;
            const token = jwt.sign({ id: user.id }, jwt_secret, { expiresIn: '1h' });         
            const expireTimeNumber: number = Date.now() + 3600000;
            const expireTimeDate = new Date(expireTimeNumber);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password_reset_token: token,
                    password_reset_expires: expireTimeDate
                },
            });
            
            // デプロイ時このURLを変える必要があります。
            const resetUrl = `http://localhost:3000/users/reset-password?token=${token}`
            // この内容に関して変える必要がある
            const content: string = `
                <p>日頃より漫画コミュニティをご利用頂き、誠にありがとうございます。</p>
                <p>漫画コミュニティ会員情報のワンタイムパスワードをお知らせ致します。</p>
                <a href=${resetUrl}>こちらをクリックしてください。</a>
            `;
            // http://localhost:8025/ を入力することでメール送信されたかがわかる。

            // const smtp = nodemailer.createTransport({
            //     host: 'smtp.example.com', //実際のSMTPサーバーのホスト名に置き換える必要があります
            //     port: 587,//25の可能性もある
            //     secure: false, // true for 465, false for other ports
            //     auth: {
            //         user: 'your_username',
            //         pass: 'your_password'//実際のユーザー名とパスワードに置き換える必要があります。
            //     }
            // });
            // この上のようにsmtpに設定しデプロイする必要があります。
            const smtp = nodemailer.createTransport({
                host: 'mailhog',
                port: 1025,
                auth: {
                    user: 'user',
                    pass: 'password'
                }
            });

            const option = {
                from: from, 
                to: to, 
                subject: subject, 
                html: content
            };

            await smtp.sendMail(option);
        } else {
            // よくわからんから400で
            res.status(400).json({error: "envファイルの型がstringではないといけません。"});
            return;
        }

        res.status(200).json({
            message: "message has been sent",
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}

interface DecodedToken {
    id: number;
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
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

        // バリデーションの結果をチェック
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            console.log(req.body)
            return res.status(400).json({ errors: errors.array(), users: req.body });
        }

        if (typeof req.query.token === 'string' && process.env.JWT_SECRET) {
            const token: string = req.query.token;
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
            const nowTimeDate: Date = new Date();
            const userId: number = decodedToken.id;

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                    password_reset_token: token,
                    password_reset_expires: { gt: nowTimeDate },
                },
            });

            if (!user) {
                res.status(401).json({ error: '無効または期限技れのパスワードリセットトークンです。' });
                return;
            }

            const saltRounds: number = 10;
            const password = req.body.password;
            const hashed_password: string = await bcrypt.hash(password, saltRounds);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashed_password,
                    password_reset_token: null,
                    password_reset_expires: null,
                },
            });

            const from: string = "llechi0420@gmail.com";
            const to: string = user.email_address;
            const subject: string = "漫画コミュニティWEBサイトより -パスワードリセット確認-";
            // この内容に関して変える必要がある
            const content: string = `
                <p>パスワードが正常にリセットされました。</p>
                <p>このリクエストを行なっていない場合は、すぐにお問い合わせください。</p>
            `;
            // http://localhost:8025/ を入力することでメール送信されたかがわかる。

            // const smtp = nodemailer.createTransport({
            //     host: 'smtp.example.com', //実際のSMTPサーバーのホスト名に置き換える必要があります
            //     port: 587,//25の可能性もある
            //     secure: false, // true for 465, false for other ports
            //     auth: {
            //         user: 'your_username',
            //         pass: 'your_password'//実際のユーザー名とパスワードに置き換える必要があります。
            //     }
            // });
            // この上のようにsmtpに設定しデプロイする必要があります。
            const smtp = nodemailer.createTransport({
                host: 'mailhog',
                port: 1025,
                auth: {
                    user: 'user',
                    pass: 'password'
                }
            });

            const option = {
                from: from, 
                to: to, 
                subject: subject, 
                html: content
            };

            await smtp.sendMail(option);

            res.status(200).json({
                message: "message has been sent",
            });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { authority_id: true, name: true } // ③authority_idとnameを取得
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};