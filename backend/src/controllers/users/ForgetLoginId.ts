import { Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

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