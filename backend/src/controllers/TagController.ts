import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export const createTag = async (req: Request, res: Response) => {
    try {
        // ここにauthoritiy_idが1では無い場合、エラーを書いて400でフロントに返す。
        if (req.session.authority_id !== 1) {
            return res.status(400).json({ error: '権限がありません。' });
        }

        await body('tag_name')
            .notEmpty().withMessage('タグ名は必須です。')
            .isString().withMessage('タグ名は文字列である必要があります。')
            .custom(async (value) => {
                const existingTagName = await prisma.tag.findUnique({ where: { tag_name: value } });
                if (existingTagName) {
                    return Promise.reject('このタグは既に登録されています。');
                }
              return true;
            }).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const tagName: string = req.body.tag_name;
        const newTag = await prisma.tag.create({
            data: {
                tag_name: tagName,
            },
        });
    
        res.status(201).json(newTag);
    } catch (error) {
        console.error("Error creating tag:", error);
        res.status(500).send('Internal Server Error');
    }
};

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await prisma.tag.findMany();

        res.status(200).json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

interface Tag {
    id: number;
    tag_name: string;
}

export const associateTagsWithWorkForCreate = async (workId: number, tags: Tag[]) => {

    const promiseTags = tags.map(tagElement => {
        let tag = prisma.tag.findFirst({
            where: { tag_name: tagElement.tag_name },
        });
        if (!tag) {
            // この処理をやるとすると根本から直す必要がある
            // return Promise.reject("不正なタグが存在します。");
        } else {
            prisma.workTag.create({
                data: {
                    work_id: workId,
                    tag_id: tagElement.id,
                }
            });
        }
    });
    try {
        await Promise.all(promiseTags);
        const message: string = "タグが正常に関連付けられました。";
        return message;
    } catch (error) {
        return error;
    }
};

export const associateTagsWithWorkForUpdate = async (workId: number, tags: Tag[]) => {

    const promiseTags = tags.map(tagElement => {
        const workTag = prisma.workTag.findFirst({
            where: {
                tag_id: tagElement.id,
                work_id: workId
            }
        });
        const tag = prisma.tag.findFirst({
            where: {
                id: tagElement.id
            }
        });
        if (!tag && !workTag) {
            prisma.workTag.delete({
                where: {
                    work_id_tag_id: {
                        work_id: workId,
                        tag_id: tagElement.id
                    }
                }
            });
        } else if (!tag) {
            // この処理をやるとすると根本から直す必要がある
            // return Promise.reject("不正なタグが存在します。");
        } else if (!workTag) {
            prisma.workTag.create({
                data: {
                    tag_id: tagElement.id,
                    work_id: workId
                },
            });
        }
    });

    try {
        await Promise.all(promiseTags);
        const message: string = "タグが正常に関連付けられました。";
        return message;
    } catch (error) {
        return error;
    }
      
};