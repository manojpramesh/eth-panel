/* globals require, module */

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.locals = {
      title: "Bletchley"
  };
  res.render('index');
});

module.exports = router;