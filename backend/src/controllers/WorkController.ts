import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';
import fs from 'fs';
import { searchByTitle, searchByTags } from './SearchController';
import { title } from 'process';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

//workの全表示//
export const getWorks = async (req: Request, res: Response) => {
    try {
        const { title, tag_names } = req.query;

        // anyは使わないで欲しい型を宣言してください。
        const where: any = {};

        if (title) {
            const titleCondition = await searchByTitle(title as string);
            where.title = titleCondition.title;
        }

        if (tag_names) {
            const tagsConditions = await searchByTags(tag_names as string | string[]);
            if (Object.keys(tagsConditions).length > 0) {
                where.AND = tagsConditions.AND;
            }
        }

        const works = await prisma.work.findMany({
            where,
            select: {
                id: true,
                title: true,
                explanation: true,
                work_image: {
                    select: {
                        file_name: true,
                    },
                },
                work_tags: {
                    select: {
                        tag: {
                            select: {
                                tag_name: true,
                            },
                        },
                    },
                },
            },
        });

        // ヒットしない時の処理書いた？

        res.json(works);
    } catch (error) {
        console.error("Error fetching works:", error);
        res.status(500).send('Internal Server Error');
    }
};




const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        // ユーザーIDまたはカテゴリ別にサブフォルダを作成
        const workImageFolder = path.join('public/images/works', req.body.title || 'unknown');
        
        // サブフォルダが存在しない場合は作成
        if (!fs.existsSync(workImageFolder)) {
            fs.mkdirSync(workImageFolder, { recursive: true });
        }

        cb(null, workImageFolder);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // ファイル名については考える必要があるかもしれません
        const fileName: string = Date() + file.originalname;
        cb(null, fileName);
    }
});

export const workImageUpload = multer({
    storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (["image/png", "image/jpeg"].includes(file.mimetype)) {
            cb(null, true);
        }else {
            cb(null, false);
        }
    }
});

export const createWork = async (req: Request, res: Response) => {
    try {
        // ログインしていない場合、エラーを返す
        if (!req.session.user_id) {
            res.status(403).json({ error: "ログインしてください。" });
            return;
        }

        // バリデーションの実行
        await body('explanation')
            .isString().withMessage('説明は文字列である必要があります。')
            .isLength({ max: 70000 }).withMessage('説明は70000文字以下でなければならない。')
            .run(req);

        await body('title')
            .notEmpty().withMessage('タイトルは必須です。')
            .isString().withMessage('タイトルは文字列である必要があります。')
            .isLength({ min: 1, max: 50 }).withMessage('タイトルは1文字以上50文字以下で設定してください。')
            .custom(async (value) => {
                const existing_title_work = await prisma.work.findFirst({ where: { title: value } });
                if (existing_title_work) {
                    return Promise.reject('この漫画のタイトルはすでに存在します。');
                }
                return true;
            }).run(req);

        // バリデーションに問題があった場合、エラーを返す
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // typescriptなので、型宣言して代入をしている。
        const explanation: string = req.body.explanation;
        const title: string = req.body.title;
        const user_id: number = req.session.user_id;
        
        // 画像ファイルがない場合、エラーを返す
        if (typeof req.file === "undefined") {
            res.status(400).json({ error: "画像ファイルがありません。" });
            return;
        }
        // 画像ファイルの格納については、ImageControllerを参照してね
        const fileName: string = req.file.filename;

        // workのrecordの保存
        const work = await prisma.work.create({
            data: {
                explanation: explanation,
                user_id: user_id,
                title: title,
                work_image: {
                    create: { file_name: fileName }
                },
            },
        });

        // 作成しなくて大丈夫
        // タグのバリデーションもしないと変なのが送られてきた時の対処ができない
        // タグについての処理.これは、TagControllerに移したい
        // タグの処理をTagControllerに委任
       
        // フロント側にworkを送る

        res.status(201).json(work);
    } catch (error) {
        // インターネットの通信についてのエラーね
        console.error("Error fetching works", error);
        console.error("Error creating work:", error);
        res.status(500).send('Internal Server Error');
    }
};

// workの詳細表示に関する関数
export const showWork = async (req: Request, res: Response) => {
    try {
        // ログインしていない場合、エラーを返す
        if (!req.session.user_id) {
            res.status(403).json({ error: "ログインしてください。" });
            return;
        }

        // 一旦格納（処理に使うものは、型宣言した後に入れるようにしたい。tsなんで）
        // ここでなぜ、work_idとworkIdと分けているか疑問でしょ！
        // work_idをテーブル、処理で使うときworkIdで使うようにしているからである。
        const userId: number = req.session.user_id;
        const workId: number = parseInt(req.params.id);

        // workIdに一致するrecordを格納する
        const work = await prisma.work.findUnique({
            where: {
                id: workId
            },
            include: {
                work_image: {
                    select: {
                        file_name: true
                    }
                },
                work_tags: {
                    include: {
                        tag: true // Include the Tag details for each WorkTag
                    }
                }
            },
        });

        // 上記で格納が成功していない場合、エラーを返す。
        if (!work) {
            return res.status(404).json({ error: "作品がみつかりません。" });
        }

        // 上記で格納が成功していない場合、エラーを返す。（これは、画像についてね）
        if (!work.work_image) {
            return res.status(404).json({ error: "作品画像がみつかりません。" });
        }

        // フロント側にworkを送る
        res.status(200).json({ work }); 
    } catch (error) {
        // インターネットの通信についてのエラーね
        console.error("Error fetching work:", error);
        res.status(500).send('Internal Server Error');
    }
};

// workへの処理に権限があるかどうかの処理
const searchWork = async (myselfUserId: number, workId: number) => {
    // workIdが一致するworkのrecordを格納
    const targetWork = await prisma.work.findUnique({
        where: {
            id: workId
        },
        include: {
            work_image: true
        }
    })
    
    // 上記のworkのuser_idと引数のuser_id(sessionのuser_id)が一致する場合、workを送る
    if (myselfUserId === targetWork?.user_id) {
        return targetWork;
    }
    // 一致しない場合、undefined(if文に入れるとfalseになる)を送る
    return undefined;
}

// workの削除機能
export const deleteWork = async (req: Request, res: Response) => {
    try {
        // 型宣言しての格納
        const workId: number = parseInt(req.params.id);

        // ログインしていない場合、エラーを返す
        if (!req.session.user_id) {
            res.status(403).json({ error: "ログインしてください。" });
            return;
        }

        // 詳しくは、一つ上の関数を参照
        const work = await searchWork(req.session.user_id, workId);

        // workがundifinedの場合、エラーを返す
        if (!work) {
            res.status(400).json({ error: "権限がありません。" })
            return ;
        }

        // 削除予定のフォルダーのパスの格納
        const folderPath: string = "public/images/works/" + work.title;

        // 上記のフォルダーが存在するかチェックしてあった場合、削除
        if (fs.existsSync(folderPath)) {
            // optionは、フォルダー以下の内容を全て削除するってことね。
            fs.rmSync(folderPath, { recursive: true, force: true });
        }

        // workの削除
        await prisma.work.delete({
            where: {
                id: workId
            }
        });

        // 成功したので、react側に204(jsonで送りたいものがない成功)を送る
        res.status(204).send();
    } catch (error) {
        // インターネットの通信についてのエラーね
        console.error("Error deleting work:", error);
        res.status(500).send('Internal Server Error');
    }
};

export const updateWork = async (req: Request, res: Response) => {
    try {
        // 型宣言して格納する
        const workId: number = parseInt(req.params.id);

        // ログインしていない場合、エラーを返す
        if (!req.session.user_id) {
            res.status(403).json({ error: "ログインしてください。" });
            return;
        }

        // バリデーションの実行
        await body('explanation')
            .optional()
            .isString().withMessage('説明は文字列である必要があります。')
            .isLength({ max: 70000 }).withMessage('説明は70000文字以下でなければなりません。')
            .run(req);

        await body('title')
            .optional()
            .isString().withMessage('タイトルは文字列である必要があります。')
            .isLength({ min: 1, max: 50 }).withMessage('タイトルは1文字以上50文字以下でなければなりません。')
            .custom(async (value) => {
                const existingTitleWork = await prisma.work.findFirst({ where: { title: value } });
                if (existingTitleWork && existingTitleWork.id !== workId) {
                    return Promise.reject('この漫画のタイトルはすでに存在します。');
                }
                return true;
            }).run(req);

        // バリデーションに問題があった場合、エラーを返す
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // 詳しくは、二つ上の関数を参照
        const work = await prisma.work.findFirst({
            where: {
                id: workId,
                user_id: req.session.user_id
            }
        });

        // workがundifinedの場合、エラーを返す
        if (!work) {
            return res.status(403).json({ error: "権限がありません。" });
        }

        // 画像ファイルがない場合、エラーを返す
        if (typeof req.file === "undefined"){
            res.status(400).json({error: "画像ファイルがありません。"})
            return ;
        }

        // 型宣言からの格納
        // ファイルの格納場所の格納
        let fileName: string | undefined = undefined;
        const title: string = req.body.title || work.title;
        const explanation: string = req.body.explanation || work.explanation;
        const filePath: string = "public/images/works/" + title + "/" + fileName;
        

        if (req.file) {
            fileName = req.file.filename;
        }

        // workの更新処理
        // Update the work
        // ここに関しては、僕の方で修正したから大丈夫。
        const updatedWork = await prisma.work.update({
            where: { id: workId },
            data: {
                title: title,
                explanation: explanation,
                ...(fileName && {
                    work_image: {
                        update: {
                            file_name: fileName,
                        }
                    }
                })
            }
        });
        // フロント側にworkを送る

        // Update the tags
        // authority=1のユーザーのみのタグの作成になるので、そこの修正をお願いします。
        const newTags = req.body.tags || [];
        if (Array.isArray(newTags)) {
            // Delete existing tags
            await prisma.workTag.deleteMany({
                where: { work_id: workId }
            });

            // Create new tags
            for (const tagName of newTags) {
                const tag = await prisma.tag.upsert({
                    where: { tag_name: tagName },
                    update: {},
                    create: { tag_name: tagName }
                });

                await prisma.workTag.create({
                    data: {
                        work_id: workId,
                        tag_id: tag.id
                    }
                });
            }
        }

        // Fetch updated tags
        const updatedTags = await prisma.workTag.findMany({
            where: { work_id: workId },
            select: { tag: true }
        });

        const tags = updatedTags.map(tag => tag.tag.tag_name);

        res.status(200).json({ work: updatedWork, tags: tags });
    } catch (error) {
        // インターネットの通信についてのエラーね
        console.error("Error updating work:", error);
        res.status(500).send('Internal Server Error');
    }
};