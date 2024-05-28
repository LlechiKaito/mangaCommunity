import { PrismaClient } from '@prisma/client'
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient()

async function main() {
    // 削除予定のフォルダーのパスの格納
    const folderPath: string = "public/images/works/dasdas";

    console.log(fs.existsSync(folderPath));
}

main()