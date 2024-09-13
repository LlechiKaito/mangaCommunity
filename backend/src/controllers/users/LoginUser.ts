import { Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス
import { User } from './Type';

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

// const secretKey = randomBytes(32).toString('hex');
// セキュリティ的に変更する必要がある。
const secretKey = "manga";

export const loginUser = async (req: Request, res: Response) => {
    try {
        const login_id: string = req.body.login_id;
        const password: string = req.body.password;

        const user: User | null = await prisma.user.findUnique({
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