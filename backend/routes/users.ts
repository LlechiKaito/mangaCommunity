import express, { Request, Response, NextFunction } from 'express';
import db from '../models'; // データベースモデルのインポート

const router = express.Router();

/* GET users listing. */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sequelizeのモデルを使ってデータを取得する
    const users = await db.Authority.findAll();

    if (!users) {
      console.log("ユーザーデータを取得できませんでした");
      return res.status(404).send('Error');
    }

    return res.json(users);
  } catch (error) {
    // console.error("データ取得エラー:", error.message);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
