import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';
import fs from 'fs';
import { title } from 'process';
import { checkBookMarks } from './BookMarkController';
import { associateTagsWithWorkForCreate, associateTagsWithWorkForUpdate } from './TagController';
import { isLoggedIn } from './users/IsLoggedIn';

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

// 本当はこれでprismaのものを代入しないといけん
interface User {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    login_id: string;
    email_address: string;
    password: string;
    name: string;
    authority_id: number;
    password_reset_token: string | null;
    password_reset_expires: Date | null;
}

//workの全表示//
export const getWorks = async (req: Request, res: Response) => {
    try {
        // データベースからデータを取得
        const works = await prisma.work.findMany({
            include: {
                work_image: true
            }
        });

        const decodedToken = await isLoggedIn(req, res);

        if (decodedToken){

            const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).user_id } });

            if (!user) {
                res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
                return ;
            }

            // ログインしているユーザーに紐づくブックマークを全て取得する
            const bookMarks = await prisma.book_mark.findMany({
                where: {
                    user_id: user.id
                }
            });

            // 取得した作品に対してブックマークがされているかをboolean型で格納
            const hasBookMarks = checkBookMarks(works, user.id, bookMarks);
            // 結果をレスポンスとして返す
            res.status(200).json({works, hasBookMarks});
            return ;
        }
        
        res.status(200).json({works});
    } catch (error) {
        console.error("Error fetching works:", error);
        res.status(500).send('Internal Server Error');
    }
};

interface Tag {
    id: number;
    tag_name: string;
}

// workのrecord保存に関する関数
export const createWork = async (req: Request, res: Response) => {
    try {
        const decodedToken = await isLoggedIn(req, res);

        if (!decodedToken){
            res.status(403).json({ error: 'ログインしていません。' });
            return ;
        }

        const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).user_id } });

        if (!user) {
            res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
            return ;
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
        const tags: Tag[] = JSON.parse(req.body.tags);

        // 画像ファイルがない場合、エラーを返す
        if (typeof req.file === "undefined"){
            res.status(400).json({error: "画像ファイルがありません。"})
            return ;
        }
        // 画像ファイルの格納については、ImageControllerを参照してね
        const fileName: string = req.file.filename;

        // workのrecordの保存
        const work = await prisma.work.create({
            data: {
                explanation: explanation,
                user_id: user.id,
                title: title,
                work_image: {
                    create: { file_name:  fileName}
                },
            },
        });

        const workId: number = work.id;
        associateTagsWithWorkForCreate(workId, tags);

        // フロント側にworkを送る
        res.status(201).json(work);
    } catch (error) {
        // インターネットの通信についてのエラーね
        console.error("Error fetching works", error);
        res.status(500).send('Internal Server Error');
    }
};

// workの詳細表示に関する関数
export const showWork = async (req: Request, res: Response) => {
    try {
        const decodedToken = await isLoggedIn(req, res);

        if (!decodedToken){
            res.status(403).json({ error: 'ログインしていません。' });
        }

        const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).id } });

        if (!user) {
            res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
            return ;
        }

        // 一旦格納（処理に使うものは、型宣言した後に入れるようにしたい。tsなんで）
        // ここでなぜ、work_idとworkIdと分けているか疑問でしょ！
        // work_idをテーブル、処理で使うときworkIdで使うようにしているからである。
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

        const decodedToken = await isLoggedIn(req, res);

        if (!decodedToken){
            res.status(403).json({ error: 'ログインしていません。' });
        }

        const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).id } });

        if (!user) {
            res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
            return ;
        }

        // 詳しくは、一つ上の関数を参照
        const work = await searchWork(user.id, workId);

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

        const decodedToken = await isLoggedIn(req, res);

        if (!decodedToken){
            res.status(403).json({ error: 'ログインしていません。' });
        }

        const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).id } });

        if (!user) {
            res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
            return ;
        }

        // バリデーションの実行
        await body('explanation')
            .isString().withMessage('説明は文字列である必要があります。')
            .isLength({ max: 70000 }).withMessage('説明は70000文字以下でなければなりません。')
            .run(req);

        await body('title')
            .notEmpty().withMessage('タイトルは必須です。')
            .isString().withMessage('タイトルは文字列である必要があります。')
            .isLength({ min: 1, max: 50 }).withMessage('タイトルは1文字以上50文字以下でなければなりません。')
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

        // 詳しくは、二つ上の関数を参照
        const work = await searchWork(user.id, workId);

        // workがundifinedの場合、エラーを返す
        if (!work) {
            res.status(403).json({ error: "権限がありません。" })
            return ;
        }

        // 画像ファイルがない場合、エラーを返す
        if (typeof req.file === "undefined"){
            res.status(400).json({error: "画像ファイルがありません。"})
            return ;
        }

        // 型宣言からの格納
        const fileName: string = req.file.filename;
        const title: string = req.body.title;
        const explanation: string = req.body.explanation;
        const tags: Tag[] = req.body.tags;

        // ファイルの格納場所の格納
        const filePath: string = "public/images/works/" + title + "/" + fileName;

        // ファイルが存在するかチェックして削除
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // workの更新処理
        await prisma.work.update({
            where: { id: workId },
            data: { 
                title: title, 
                explanation: explanation, 
                work_image: {
                    update:{
                        file_name: fileName,
                    }
                }
            }
        })

        associateTagsWithWorkForUpdate(workId, tags);

        // フロント側にworkを送る
        res.status(200).json({ work: updateWork });

    } catch (error) {
        // インターネットの通信についてのエラーね
        console.error("Error updating work:", error);
        res.status(500).send('Ineternal Server Error');
    }
};

