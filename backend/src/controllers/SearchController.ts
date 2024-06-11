// SearchController.ts
import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express'; // Import types

const prisma = new PrismaClient();


export const searchByTitle = async (title: string) => {
    return {
        title: {
            contains: title,
        },
    };
};

export const searchByTags = async (tag_names: string | string[]) => {
    const tagsArray = Array.isArray(tag_names) ? tag_names : tag_names.split(',');
    const tagIds = await prisma.tag.findMany({
        where: {
            tag_name: { in: tagsArray },
        },
        select: { id: true },
    });

    const tagIdsArray = tagIds.map(tag => tag.id);

    if (tagIdsArray.length > 0) {
        return {
            AND: tagIdsArray.map(tagId => ({
                work_tags: {
                    some: {
                        tag_id: tagId,
                    },
                },
            })),
        };
    }

    return {};
};


// users/result エンドポイントで使用する検索関数
export const getUsersBySearch = async (req: Request, res: Response) => {
    try {
        const { user_name } = req.query;

        let searchCriteria = {};

        if (user_name) {
            searchCriteria = {
                user_name: {
                    contains: user_name as string,
                    mode: 'insensitive',
                },
            };
        }

        const users = await prisma.user.findMany({
            where: searchCriteria,
            include: {
                authority: true,
            },
        });

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Internal Server Error');
    }
};

//workの全表示//
export const getWorksBySearch = async (req: Request, res: Response) => {
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

        // ヒットしない時の処理をかいて

        if (works.length === 0) {
            // ヒットしない場合の処理を記述する
            res.status(404).json({ message: 'No works found' });
        } else {
            res.json(works);
        }
    } catch (error) {
        console.error("Error fetching works:", error);
        res.status(500).send('Internal Server Error');
    }
};
