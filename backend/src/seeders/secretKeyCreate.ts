import { PrismaClient } from '@prisma/client'
import crypto from 'crypto';

const prisma = new PrismaClient()

async function main() {

    // 32バイトのランダムなバッファを生成し、それを16進数文字列に変換する
    const secretKey = crypto.randomBytes(32).toString('hex');
    
    console.log(secretKey);
}

main()