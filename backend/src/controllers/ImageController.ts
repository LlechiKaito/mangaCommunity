import { Express, Request, Response } from 'express'; // Import types
import multer, { FileFilterCallback } from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        // 作成予定フォルダーパスのpublic/images/works/タイトル名を格納(タイトル名がない場合、unknownにして保存)
        const workImageFolder = path.join('public/images/works', req.body.title || 'unknown');
        
        // 上記のフォルダーがない場合、作成
        if (!fs.existsSync(workImageFolder)) {
            fs.mkdirSync(workImageFolder, { recursive: true });
        }

        // 上記のフォルダーに格納する予定ってこと
        cb(null, workImageFolder);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // ファイル名の格納からそのファイル名で格納予定ってこと(ファイル名については考える必要があるかもしれません)
        const fileName: string = Date() + file.originalname;
        cb(null, fileName);
    }
});

export const workImageUpload = multer({
    storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        // pngとjpegのみ保存を許可
        if (["image/png", "image/jpeg"].includes(file.mimetype)) {
            cb(null, true);
        // 他の拡張子の場合、保存を許可しない
        }else {
            cb(null, false);
        }
    }
});