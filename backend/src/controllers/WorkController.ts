import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';
import fs from 'fs';
import { title } from 'process';

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

//workの全表示//
export const getWorks = async (req: Request, res: Response) => {
    try {
        // クエリパラメータから検索条件を取得
        const { title } = req.query;

        // whereオブジェクトを初期化
        const where: any = {};

        // titleが指定されている場合のフィルタリング
        if (title) {
            where.title = {
                contains: title as string
            };
        }

        // データベースからデータを取得
        const works = await prisma.work.findMany({
            where,
            select: {
                id: true,
                title: true,
                explanation: true,
                work_image: {
                    select: {
                        file_name: true
                    }
                }
            }
        });

        // 結果をレスポンスとして返す
        res.json(works);
    } catch (error) {
        console.error("Error fetching works:", error);
        res.status(500).send('Internal Server Error');
    }
};

// workのrecord保存に関する関数
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
        const tag: string = req.body.tag;

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
                user_id: user_id,
                title: title,
                work_image: {
                    create: { file_name:  fileName}
                },
            },
        });

        // タグについての処理.これは、TagControllerに移したい
        if (tag) {
            const existingTag = await prisma.tag.findFirst({
                where: { tag_name: tag },
            });

            if (existingTag) {
                await prisma.workTag.create({
                    data: {
                        work_id: work.id,
                        tag_id: existingTag.id,
                    },
                });
            }
        }

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
        const work = await searchWork(req.session.user_id, workId);

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
        });
        // フロント側にworkを送る
        res.status(200).json({ work: updateWork });

    } catch (error) {
        // インターネットの通信についてのエラーね
        console.error("Error updating work:", error);
        res.status(500).send('Ineternal Server Error');
    }
};

