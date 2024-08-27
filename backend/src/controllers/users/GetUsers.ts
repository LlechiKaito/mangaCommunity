import { Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

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
