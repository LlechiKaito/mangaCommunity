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

  // ここにauthoritiy_idが1では無い場合、エラーを書いて400でフロントに返す。
  if (req.session.authority_id !== 1) {
    return res.status(400).json({ error: '権限がありません。' });
  }

  await body('tag_name')
    .notEmpty().withMessage('タグ名は必須です。')
    .isString().withMessage('タグ名は文字列である必要があります。')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const tag_name: string = req.body;

  const existingTag = await prisma.tag.findFirst({
    where: { tag_name: tag_name },
  });

  if (existingTag) {
    return res.status(400).json({ error: 'そのタグ名はすでに存在しています。' });
  }
  // バリデーションを実行してからの格納にしてください。
  // uniqueに関しては、バリデーションで指定できます。（workを参考にして！）



  const newTag = await prisma.tag.create({
    data: {
      tag_name: tag_name,
    },
  });

  res.status(201).json(newTag);

};

export const getTags = async (req: Request, res: Response) => {
  const tags = await prisma.tag.findMany();
  res.status(200).json(tags);
};

export const associateTagsWithWork = async (req: Request, res: Response) => {
  const { work_id, tags } = req.body;

  console.log("Received request body:", req.body);

  // work_id がない場合はエラーを返す
  if (!work_id) {
    console.error("Invalid request: work_id is missing", req.body);
    return res.status(400).json({ error: "無効なリクエストです。" });
  }

  // tags がない場合は何もしないで処理を通す
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return res.status(201).json({ message: "タグが提供されていません。" });
  }

  const tagRecords = await processTags(tags);
  const workTagPromises = tagRecords.map(tag => {
    return prisma.workTag.create({
      data: {
        work_id: work_id,
        tag_id: tag.id,
      },
    });
  });

  await Promise.all(workTagPromises);

  res.status(201).json({ message: "タグが正常に関連付けられました。" });
};

// タグを処理するためのヘルパー関数
export const processTags = async (tags: string[]): Promise<{ id: number; tag_name: string }[]> => {
  const tagRecords = [];
  for (const tagName of tags) {
    let tag = await prisma.tag.findFirst({
      where: { tag_name: tagName },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: { tag_name: tagName },
      });
    }
    tagRecords.push(tag);
  }
  return tagRecords;
};