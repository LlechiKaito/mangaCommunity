import { Express, Request, Response } from 'express'; // Import types
import { PrismaClient } from '@prisma/client';
import bcrypt, { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { stringify } from 'querystring';

const prisma = new PrismaClient();

export const createTag = async (req: Request, res: Response) => {

    // ここにauthoritiy_idが1では無い場合、エラーを書いて400でフロントに返す。

    // バリデーションルール
    // 型定義しての格納にしてください
    const { tag_name } = req.body;

    const existingTag = await prisma.tag.findFirst({
        where: { tag_name: tag_name },
    });

    if (existingTag) {
        return res.status(400).json({ error: 'そのタグ名はすでに存在しています。' });
    }
    // バリデーションを実行してからの格納にしてください。
    // uniqueに関しては、バリデーションで指定できます。（workを参考にして！）
    await body('tag_name')
        .notEmpty().withMessage('タグ名は必須です。')
        .isString().withMessage('タグ名は文字列である必要があります。')
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // try-catch構文はいらないです。
    try {
      const newTag = await prisma.tag.create({
        data: {
          tag_name: tag_name,
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
    const tags = await prisma.tag.findMany({ select: {tag_name: true} });

    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};