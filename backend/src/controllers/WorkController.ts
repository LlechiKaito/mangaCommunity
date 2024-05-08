import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';

const prisma = new PrismaClient();

//全表示//
export const getWorks = async (req: Request, res: Response) => {
    try {
        const works = await prisma.work.findMany({});
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


        const explanation: string = req.body.explanation;
        const title: string = req.body.title;
        const user_id: number | undefined = req.session.user_id;
        const workImage: string = req.body.work_image;

        const work = await prisma.work.create({
            data: {
                explanation: explanation,
                user_id: user_id,
                title: title,
                workimage: {
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
        const workId = parseInt(req.params.id);

        const work = await prisma.work.findUnique({
            where: {
                id: workId
            },
        });

        if (!work) {
            return res.status(404).json({ error: "作品がみつかりません。" });
        }

        const work_image = await prisma.work_image.findUnique({
            where: {
                work_id: workId
            },
        });

        if (!work_image) {
            return res.status(404).json({ error: "作品画像がみつかりません。" });
        }


        res.json({work, work_image}); //ShowWork.tsxのshowwork関数に送る
    
    } catch (error) {
        console.error("Error fetching work:", error);
        res.status(500).send('Internal Server Error');
    }
};

export const deleteWork = async (req: Request, res: Response) => {
    try {
        const workId = parseInt(req.params.id);

        await prisma.work_image.delete({
            where: {
                work_id:workId
            }
        });

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

        const explanation: string = req.body.explanation;
        const title: string = req.body.title;
        const workImage: string = req.body.work_image;

        const updateWork = await prisma.work.update({
            where: { id: workId }, // 更新対象の作品のIDを指定
            data: {
                title: title, // タイトルを更新
                explanation: explanation, // 説明を更新
            },
        });

        const updateWorkimage = await prisma.work_image.update({
            where: { work_id: workId},
            data: {
                file_name: workImage,
            }
        })
        res.json({ updateWork, updateWorkimage });
        
    } catch (error) {
        console.error("Error updating work:", error);
        res.status(500).send('Ineternal Server Error');
    }
};

