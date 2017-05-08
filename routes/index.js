/* globals require, module */

var express = require('express');
var router = express.Router();

router.get('/home', function (req, res) {
  res.locals = {
      title: "Eth Panel"
  };
  res.render('index');
});

router.get('/doc', function(req, res) {
  res.render('../doc/index');
});


module.exports = router;