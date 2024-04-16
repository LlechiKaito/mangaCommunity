var express = require('express');
var router = express.Router();

const mysql = require('mysql2');

var db = require('../models/');

/* GET users listing. */
router.get('/', function(req, res, next) {

  // Sequelizeのモデルを使ってデータを取得する
  db.Authority.findAll().then(users => {

    if (!users) {
        console.log("ユーザーデータを取得できませんでした");
        res.send('Error');
    } else {
        res.json(users);
    }
  });

});

module.exports = router;
