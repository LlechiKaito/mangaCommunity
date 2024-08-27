import { Request, Response } from 'express'; // Import types
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' }); // .envファイルへのパス

// const secretKey = randomBytes(32).toString('hex');
// セキュリティ的に変更する必要がある。
const secretKey = "manga";


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