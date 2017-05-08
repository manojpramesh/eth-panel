/* globals require, global, module */

var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;


router.get('/exceptions', function (req, res, next) {
  MongoClient.connect(global.mongoUrl, function (err, db) {
    db.collection('log').find({}).toArray(function (error, documents) {
      if (err) throw error;
      res.json(documents);
    });
  });
});

router.get('/stat', function (req, res, next) {
  MongoClient.connect(global.mongoUrl, function (err, db) {
    db.collection('stat').find({}).toArray(function (error, documents) {
      if (err) throw error;
      res.json(documents);
    });
  });
});

module.exports = router;