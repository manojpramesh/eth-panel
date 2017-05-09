/* globals require, module, global */

var express = require('express');
var router = express.Router();
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(global.web3Provider));


router.get('/home', function (req, res) {
  res.locals = {
    title: "Eth Panel",
    blocks: getlatestBlocks(10)
  };
  res.render('index');
});

router.get('/doc', function (req, res) {
  res.render('../doc/index');
});


var getlatestBlocks = function (n) {
  var result = [];
  var lastBlock = web3.eth.blockNumber;
  for (var i = lastBlock; i > lastBlock - n; i--) {
    result.push(web3.eth.getBlock(i));
  }
  return result;
}

module.exports = router;