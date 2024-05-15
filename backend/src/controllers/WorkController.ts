import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';

const prisma = new PrismaClient();

//全表示//
export const getWorks = async (req: Request, res: Response) => {
    try {
        const works = await prisma.work.findMany({
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
        res.json(works);
    } catch (error) {
        console.error("Error fetching works:", error);
        res.status(500).send('Internal Server Error');
    }
};

export const createWork = async (req: Request, res: Response) => {
    try {
        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
            //res.redirect('/users/login');
            return;
        }

        await body('explanation')
            .notEmpty().withMessage('説明は必須です。')
            .isString().withMessage('説明は文字列である必要があります。')
            .isLength({ min: 1, max: 70000 }).withMessage('説明は1文字以上70000文字以下で設定してください。')
            .run(req);

        await body('title')
            .notEmpty().withMessage('タイトルは必須です。')
            .isString().withMessage('タイトルは文字列である必要があります。')
            .isLength({ min: 1, max: 50 }).withMessage('タイトルは1文字以上50文字以下で設定してください。')
            .run(req);

        await body('work_image.file_name')
            .notEmpty().withMessage('ファイル名は必須です。')
            .isString().withMessage('ファイル名は文字列である必要があります。')
            .isLength({ min: 1, max: 100 }).withMessage('ファイル名は1文字以上100文字以下である必要があります。')
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        const explanation: string = req.body.explanation;
        const title: string = req.body.title;
        const user_id: number = req.session.user_id;
        const workImage: string = req.body.work_image;

        const work = await prisma.work.create({
            data: {
                explanation: explanation,
                user_id: user_id,
                title: title,
                work_image: {
                    create: { file_name: workImage }
                },
            },
        });
        res.status(201).json(work);
    } catch (error) {
        console.error("Error fetching works", error);
        res.status(500).send('Internal Server Error');
    }
};

export const showWork = async (req: Request, res: Response) => {
    try {
        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
            //res.redirect('/users/login');
            return;
        }

        const userId: number = req.session.user_id;

        const workId = parseInt(req.params.id);


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

        if (!work) {
            return res.status(404).json({ error: "作品がみつかりません。" });
        }

        if (!work.work_image) {
            return res.status(404).json({ error: "作品画像がみつかりません。" });
        }

        // ブックマークの状態を取得
        const isBookmarked = await checkBookmark(userId, workId);

        res.json({ work, isBookmarked }); //ShowWork.tsxのshowwork関数に送る

    } catch (error) {
        console.error("Error fetching work:", error);
        res.status(500).send('Internal Server Error');
    }
};

// ブックマークの状態をチェックする関数
const checkBookmark = async (userId: number, workId: number): Promise<boolean> => {
    const bookmark = await prisma.book_mark.findFirst({
        where: {
            user_id: userId,
            work_id: workId
        }
    });

    return bookmark ? true : false;
};

export const deleteWork = async (req: Request, res: Response) => {
    const workId = parseInt(req.params.id);

    try {
        await prisma.work.delete({
            where: {
                id: workId
            }
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting work:", error);
        res.status(500).send('Internal Server Error');
    }
};

export const updateWork = async (req: Request, res: Response) => {
    try {
        const workId = parseInt(req.params.id);

        await body('explanation')
            .notEmpty().withMessage('説明は必須です。')
            .isString().withMessage('説明は文字列である必要があります。')
            .isLength({ min: 1, max: 70000 }).withMessage('説明は1文字以上70000文字以下で設定してください。')
            .run(req);

        await body('title')
            .notEmpty().withMessage('タイトルは必須です。')
            .isString().withMessage('タイトルは文字列である必要があります。')
            .isLength({ min: 1, max: 50 }).withMessage('タイトルは1文字以上50文字以下で設定してください。')
            .run(req);

        await body('work_image.file_name')
            .notEmpty().withMessage('ファイル名は必須です。')
            .isString().withMessage('ファイル名は文字列である必要があります。')
            .isLength({ min: 1, max: 100 }).withMessage('ファイル名は1文字以上100文字以下である必要があります。')
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, explanation, file_name } = req.body;

        await prisma.work.update({
            where: { id: workId },
            data: { title: title, explanation: explanation, work_image: file_name }
        });
        res.json({ updateWork });

    } catch (error) {
        console.error("Error updating work:", error);
        res.status(500).send('Ineternal Server Error');
    }
};

