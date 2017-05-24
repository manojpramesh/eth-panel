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


// Deploy new contract
router.post('/deploy', function (req, res) {
    var compiledContract = compileContract(req.body.contract, req.body.name);
    var rawTx = {
        nonce: web3.toHex(web3.eth.getTransactionCount(fromAccount)),
        gasPrice: web3.toHex(web3.eth.gasPrice),
        gasLimit: web3.toHex(3500000),
        from: fromAccount,
        data: compiledContract.contractData
    };
    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    var serializedTx = tx.serialize();

    var hash = web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex'));

    var receipt = null;
    while (receipt === null) {
        receipt = web3.eth.getTransactionReceipt(hash);
    }

    fs.writeFile("Contract/" + req.body.name.replace(":", "") + ".sol", req.body.contract);

    res.json({
        th: hash,
        ad: receipt.contractAddress,
        abi: compiledContract.abi
    });
});


// Read from contract
router.get('/:contract/:function/:id', function (req, res) {
    var contractAddress = global.contracts[req.params.contract].address;
    var abi = global.contracts[req.params.contract].abi;
    var contract = web3.eth.contract(abi).at(contractAddress);

    var response = contract[req.params.function](req.query.id);
    res.json(response);
});

// write to contract
router.post('/:contract/:function', function (req, res) {
    var contractAddress = global.contracts[req.params.contract].address;
    var abi = global.contracts[req.params.contract].abi;

    var data = {
        params: req.query.params.split(','),
        name: req.params.function,
        amount: 0,
        fromAccount: fromAccount,
        contractAddress: contractAddress,
        abi: abi,
        privateKey: privateKey
    };
    var hash = writeToContract(data);
    res.json(hash);
});


// Redeploy a contract
router.get('/reDeploy/:contract', function (req, res) {
    var input = fs.readFileSync('Contract/' + req.params.contract + '.sol', 'utf8');

    var compiledContract = compileContract(input, ":" + req.params.contract);

    var rawTx = {
        nonce: web3.toHex(web3.eth.getTransactionCount(fromAccount)),
        gasPrice: web3.toHex(web3.eth.gasPrice),
        gasLimit: web3.toHex(3500000),
        from: fromAccount,
        data: compiledContract.contractData
    };
    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    var serializedTx = tx.serialize();

    var hash = web3.eth.sendRawTransaction("0x" + serializedTx.toString('hex'));

    var receipt = null;
    while (receipt == null) {
        receipt = web3.eth.getTransactionReceipt(hash);
    }
    res.json({
        th: hash,
        ad: receipt.contractAddress,
        abi: compiledContract.abi
    });
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