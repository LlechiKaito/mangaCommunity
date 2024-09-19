import { Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス
import { User } from './Type';

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

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
            res.status(400).json({ errors: errors.array(), users: req.body });
            return ;
        }

        if (typeof req.query.token === 'string' && process.env.JWT_SECRET) {
            const token: string = req.query.token;
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
            const nowTimeDate: Date = new Date();
            const userId: number = decodedToken.id;

            const user: User | null = await prisma.user.findUnique({
                where: {
                    id: userId,
                    password_reset_token: token,
                    password_reset_expires: { gt: nowTimeDate },
                },
            });

            if (!user) {
                res.status(401).json({ errors: '無効または期限技れのパスワードリセットトークンです。' });
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

            res.status(204).send('正常にメールを送ることができた。');
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}