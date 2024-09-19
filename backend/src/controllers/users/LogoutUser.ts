import { Request, Response } from 'express'; // Import types
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス

export const logoutUser = async (req: Request, res: Response) => {
    try {
        console.log(req.headers['authorization'])
        if (!req.headers['authorization'] || Array.isArray(req.headers['authorization'])){
            res.status(401).json({error: "トークンがありません。"})
            return; 
        }
        
        // ブラックリスト方式やリフレッシュトークンなどを導入してセキュリティを強固にする必要があるが、今は何もしない

        res.status(204).send('正常にログインできました。');
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
}