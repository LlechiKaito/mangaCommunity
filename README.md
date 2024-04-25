<h1>mangaCommunity概要</h1>

<h2>docker関係<h3>

<h3>dockerのプロジェクトの起動</h3>
<p>cd docker</p>
<p>docker-compose up</p>

<h3>dockerのbackend側(node.js(express.js))の起動</h3>
<p>docker exec -u node -it back /bin/bash</p>
<p>backendの起動の仕方</p>
<p>npm run dev</p>
<p>port：8080</p>
<p>migrate(テーブル作成)とseeder(データ補充)を更新してください</p>
<p>migrateの更新のやり方</p>
<p>npx prisma migrate dev --name init</p>
<p>seederの更新のやり方(上から順番通りにやってね)</p>
<p>npx nodemon src/seeders/userCreateLlechi.ts </p>
<p>npx nodemon src/seeders/userCreateFree.ts </p>
<p>npx nodemon src/seeders/userCreateLlechi.ts </p>
<p>npx nodemon src/seeders/userCreateFree.ts </p>


<h3>dockerのfrontend側(React)の起動</h3>
<p>docker exec -u node -it front /bin/bash</p>
<p>cd app</p>
<p>npm start</p>
<p>port：3000</p>
<p>基本的にhttp://localhost:3000/これでリクエストを送る</p>

<h3>dockerのmysqlの起動</h3>
<p>docker-compose exec mysql mysql -uroot -p</p>
<p>パスワード：manga</p>
<p>データベース名：mangacommunity</p>

<h2>簡単なルール</h2>
<p>勝手にマージせずプルリクを送る（僕が大丈夫か判断する）</p>
<p>タブサイズを４とする。</p>
<p>あとは、楽しく開発をしよう</p>

<h3>開発環境詳細</h3>
<p>開発環境：node.js</p>
<p>バックエンド：express.js</p>
<p>フロントエンド：react</p>
<p>cssのフレームワーク：tailwind</p>
<p>ORM：prisma</p>
<p>データベース：mysql</p>
<p>web3.js使うのにtruffle</p>