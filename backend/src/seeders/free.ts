import { PrismaClient } from '@prisma/client'
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient()

async function main() {


    // ユーザーIDまたはカテゴリ別にサブフォルダを作成
    const userFolder = path.join('public/images/users', "1");
    console.log(userFolder);
    fs.mkdirSync(userFolder, { recursive: true });
}

main()