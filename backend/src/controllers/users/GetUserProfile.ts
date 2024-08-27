import { Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

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