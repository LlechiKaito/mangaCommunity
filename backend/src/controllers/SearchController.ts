// SearchController.ts
import { PrismaClient } from '@prisma/client';
import { Express, Request, Response } from 'express'; // Import types
import { isLoggedIn } from './users/IsLoggedIn';
import { checkBookMarks } from './BookMarkController';
import { User } from './users/Type';

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

        const users: User[] = await prisma.user.findMany({
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
        const { title } = req.query;

        // タイトルに基づいた検索フィルターを作成
        const searchFilter = title ? await searchByTitle(title as string) : {};

        // データベースからフィルターに基づいて作品を取得
        const works = await prisma.work.findMany({
            where: searchFilter,
            include: {
                work_image: true,
            },
        });

        const decodedToken = await isLoggedIn(req, res);

        if (decodedToken) {

            const user: User | null = await prisma.user.findUnique({ where: { id: (decodedToken as any).user_id } });

            if (!user) {
                res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
                return;
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
            res.status(200).json({ works, hasBookMarks });
            return;
        }

        res.status(200).json({ works });
    } catch (error) {
        console.error("Error fetching works:", error);
        res.status(500).send('Internal Server Error');
    }
};