/* globals require, global, module, Buffer */

var express = require('express');
var Web3 = require('web3');
var fs = require('fs');
var Tx = require('ethereumjs-tx');
var solc = require('solc');
var _ = require('lodash');
var SolidityFunction = require('web3/lib/web3/function');

// Create express router
var router = express.Router();

// create web3 instance
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(global.web3Provider));

// account constants
var fromAccount = global.accounts[0].address;
var privateKey = new Buffer(global.accounts[0].privateKey, 'hex');


// Home page
router.get('/', function (req, res) {
    res.locals = {
        title: "Eth Panel"
    };
    res.render('contracts');
});


// Compile solidity
router.post('/compile', function (req, res) {
    res.json(compileContract(req.body.contract, req.body.name));
});





// **********************************
// Functions
// **********************************
var compileContract = function (input, name) {
    var compiledContract = solc.compile(input, 1);
    var interface = compiledContract.contracts[name].interface;
    var contractObj = web3.eth.contract(JSON.parse(interface));
    var code = compiledContract.contracts[name].bytecode;
    return ({
        compiled: compiledContract,
        abi: interface,
        bytecode: code,
        contract: contractObj,
        contractData: contractObj.new.getData({
            data: '0x' + code
        })
    });
};

function writeToContract(data) {
    var tx = new Tx({
        nonce: web3.toHex(web3.eth.getTransactionCount(data.fromAccount)),
        gasPrice: web3.toHex(web3.eth.gasPrice),
        gasLimit: web3.toHex(300000),
        to: data.contractAddress,
        from: data.fromAccount,
        value: web3.toHex(data.amount),
        data: new SolidityFunction('', _.find(data.abi, {
            name: data.name
        }), '').toPayload(data.params).data
    });
    tx.sign(data.privateKey);
    var serializedTx = tx.serialize();
    var hash = web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex'));
    return hash;
}



module.exports = router;