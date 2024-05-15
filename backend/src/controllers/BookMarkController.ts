import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();


export const doBookMark = async (req: Request, res: Response) => {
    try {
        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
            //res.redirect('/users/login');
            return;
        }

        const userId: number = req.session.user_id;

        const workId = parseInt(req.params.id);

        const book_mark = await prisma.book_mark.create({
            data: {
                user_id: userId,
                work_id: workId,
            },
        });
        res.status(201).json(book_mark);
    } catch (error) {
        console.error("Error fetching works", error);
        res.status(500).send('Internal Server Error');
    }
};

export const undoBookMark = async (req: Request, res: Response) => {
    try {
        if (!req.session.user_id) {
            res.status(403).json({ error_login: "ログインしてください。" });
            //res.redirect('/users/login');
            return;
        }

        const userId: number = req.session.user_id;

        const workId = parseInt(req.params.id);

        await prisma.book_mark.delete({
            where: {
                user_id_work_id: {
                    user_id: userId,
                    work_id: workId
                }
            }
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error fetching works", error);
        res.status(500).send('Internal Server Error');
    }
    
};