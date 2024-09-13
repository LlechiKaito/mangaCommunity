import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { isLoggedIn } from './users/IsLoggedIn';
import { User } from './users/Type';

// prismaのログの確認のためのやつ
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export const getBookMarks = async (req: Request, res: Response) => {
    try {
        const decodedToken = await isLoggedIn(req, res);

        if (!decodedToken){
            res.status(403).json({ error: 'ログインしていません。' });
        }

        const user: User | null = await prisma.user.findUnique({ where: { id: (decodedToken as any).user_id } });

        if (!user) {
            res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
            return ;
        }

        const bookMarks = await prisma.book_mark.findMany({
            where: {
                user_id: user.id
            },
            include: {
                work: {
                    include:{
                        work_image: true
                    }
                }
            }
        });

        if (!bookMarks) {
            res.status(404).json({error: "ブックマークした漫画は存在しません。"});
        }
        
        const worksWithBookMarks = bookMarks.flatMap(book_mark => book_mark.work)

        res.status(200).json({works: worksWithBookMarks});
        
    } catch (error) {
        console.error("Error fetching works", error);
        res.status(500).send('Internal Server Error');
    }
}

export const doBookMark = async (req: Request, res: Response) => {
    try {
        const decodedToken = await isLoggedIn(req, res);

        if (!decodedToken){
            res.status(403).json({ error: 'ログインしていません。' });
            return;
        }

        const user: User | null = await prisma.user.findUnique({ where: { id: decodedToken.user_id } });

        if (!user) {
            res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
            return ;
        }

        // 宣言して格納する。
        const workId: number = parseInt(req.params.id);

        // workIdとuserIdでbook_markのレコードの作成
        const book_mark = await prisma.book_mark.create({
            data: {
                user_id: user.id,
                work_id: workId,
            },
        });
        // フロント側にbook_markを送信
        res.status(201).json(book_mark);
    } catch (error) {
        // インターネットによるエラーを返す
        console.error("Error fetching works", error);
        res.status(500).send('Internal Server Error');
    }
};

export const undoBookMark = async (req: Request, res: Response) => {
    try {
        const decodedToken = await isLoggedIn(req, res);

        if (!decodedToken){
            res.status(403).json({ error: 'ログインしていません。' });
            return
        }

        const user: User | null = await prisma.user.findUnique({ where: { id: decodedToken.user_id } });

        if (!user) {
            res.status(404).json({ error: 'ユーザーが見つかりませんでした。' });
            return ;
        }

        // 型宣言して格納する
        const workId: number = parseInt(req.params.id);

        // userIdとworkIdが一致するbook_markの削除
        await prisma.book_mark.delete({
            where: {
                user_id_work_id: {
                    user_id: user.id,
                    work_id: workId
                }
            }
        });
        // フロントに成功の旨を送信
        res.status(204).send();
    } catch (error) {
        // インターネットによるエラー
        console.error("Error fetching works", error);
        res.status(500).send('Internal Server Error');
    }
};

interface works {
    id: number;
}

interface bookMarks {
    work_id: number;
}

export const checkBookMarks = (works: works[], myUserId: number | undefined, bookMarks: bookMarks[]) => {
    let hasBookMarks: boolean[] = [];

    if (!myUserId){
        works.forEach(work => {
            hasBookMarks.push(false);
        });
    } else {
        let flag: boolean = true;
        works.forEach(work => {
            for (const bookMark of bookMarks) {
                if (bookMark.work_id === work.id) {
                    hasBookMarks.push(true);
                    flag = false;
                    break;
                }  
            }
            if (flag){
                hasBookMarks.push(false);
            } else {
                flag = true;
            }
        });
    }
    return hasBookMarks;
}