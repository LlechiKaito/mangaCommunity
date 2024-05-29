import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { searchByTitle, searchByTags } from './SearchController';

const prisma = new PrismaClient();

//全表示//
export const getWorks = async (req: Request, res: Response) => {
    try {
        const { title, tag_names } = req.query;

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
        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
            return;
        }

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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const explanation: string = req.body.explanation;
        const title: string = req.body.title;
        const user_id: number = req.session.user_id;
        const tags: string[] = req.body.tags;

        if (typeof req.file === "undefined") {
            res.status(400).json({ error_message: "画像ファイルがありません。" });
            return;
        }
        const fileName: string = req.file.filename;

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

        if (tags && tags.length > 0) {
            const tagPromises = tags.map(async (tagName) => {
                let tag = await prisma.tag.findFirst({
                    where: { tag_name: tagName },
                });

                if (!tag) {
                    tag = await prisma.tag.create({
                        data: { tag_name: tagName },
                    });
                }

                await prisma.workTag.create({
                    data: {
                        work_id: work.id,
                        tag_id: tag.id,
                    },
                });
            });

            await Promise.all(tagPromises);
        }

        res.status(201).json(work);
    } catch (error) {
        console.error("Error creating work:", error);
        res.status(500).send('Internal Server Error');
    }
};
export const showWork = async (req: Request, res: Response) => {
    try {
        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
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
                work_tags: {
                    include: {
                        tag: true // Include the Tag details for each WorkTag
                    }
                }
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

const searchWork = async (myselfUserId: number, workId: number) => {
    const targetWork = await prisma.work.findUnique({
        where: {
            id: workId
        },
        include: {
            work_image: true
        }
    })
    if (myselfUserId === targetWork?.user_id) {
        return targetWork;
    }
    return undefined;
}

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
    try {
        const workId = parseInt(req.params.id);

        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
            return;
        }

        const work = await searchWork(req.session.user_id, workId);

        if (!work) {
            res.status(400).json({ error_user: "権限がありません。" })
            return ;
        }

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

        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
            return;
        }

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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const work = await prisma.work.findFirst({
            where: {
                id: workId,
                user_id: req.session.user_id
            }
        });

        if (!work) {
            return res.status(400).json({ error_user: "権限がありません。" });
        }

        const title: string = req.body.title || work.title;
        const explanation: string = req.body.explanation || work.explanation;
        let fileName: string | undefined = undefined;

        if (req.file) {
            fileName = req.file.filename;
        }

        // Update the work
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

        // Update the tags
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
        console.error("Error updating work:", error);
        res.status(500).send('Internal Server Error');
    }
};