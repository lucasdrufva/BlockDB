// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var fs = require('fs');
const SHA256 = require("crypto-js/sha256");
var text = fs.readFileSync('settings.txt','utf8');
var settings = JSON.parse(text);
if (process.argv[2] === "-p" || process.argv[2] === "--port") {
  settings[0] = parseInt(process.argv[3]);
  fs.writeFileSync('./settings.txt', JSON.stringify(settings));
}
if (process.argv[2] === "-u" || process.argv[2] === "--adduser") {
  var username = process.argv[3];
  var password = SHA256(process.argv[4]).toString();
  var text = fs.readFileSync('users.txt','utf8');
  var users = JSON.parse(text);
  var newUser = JSON.parse('{"user":"' + username + '", "pass":"' + password + '"}');
  users.push(newUser);
  console.log(users);
  fs.writeFileSync('./users.txt', JSON.stringify(users));
}
var port = process.env.PORT || settings[0];
const bc = require('./blockchain');
var request = require('request');
var bodyParser = require('body-parser');
var authlevel = settings[1]; //0 = no authentication, 1 = authentication needed only to write, 2 = authentication needed for both reed and write
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));


class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
      return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
        this.nonce++;
        this.hash = this.calculateHash();
    }

    console.log("BLOCK MINED: " + this.hash);
  }
}


//bc.saveToFile();
bc.loadFromFile();
//var blockchain = require('./main.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    //console.log(strack.chain);
    //res.json(blockchain.strack.chain);
    bc.loadFromFile();
    res.send(200);

});

router.get('/authlevel', function(req, res) {
    res.send(authlevel.toString());

});
/*router.get('/getBlock/:blockIndex', function(req, res) {
    //console.log(strack.chain);
    //res.json(blockchain.strack.chain);
    var request = req.params;
    var block = request.blockIndex;
    bc.loadFromFile();
    var sendBlock = bc.chain[block];

    res.json(sendBlock);

});*/

if(authlevel == 2){
    router.get('/getBlockName/:user/:pass/:blockName', function(req, res) {
    //console.log(strack.chain);
    //res.json(blockchain.strack.chain);

      var request = req.params;
      var user = request.user.replace("%20", " ");
      var pass = request.pass;
      var text = fs.readFileSync('users.txt','utf8');
      var users = JSON.parse(text);
      for (var i = 0; i < users.length; i++) {
        if(users[i].user === user){
          if(users[i].pass === pass){
            var block = request.blockName.replace("%20", " ");
            bc.loadFromFile();
            for (var i = bc.chain.length - 1; i > -1; i--) {
              if(bc.chain[i].name === block){
                var sendBlock = bc.chain[i];
                break;
              }

            }


            res.json(sendBlock);
          }
        }
      }
    });
}else{
  router.get('/getBlockName/:blockName', function(req, res) {
      //console.log(strack.chain);
      //res.json(blockchain.strack.chain);

      var request = req.params;
      var block = request.blockName.replace("%20", " ");
      bc.loadFromFile();
      for (var i = bc.chain.length - 1; i > -1; i--) {
        if(bc.chain[i].name === block){
          var sendBlock = bc.chain[i];
          break;
      }

    }
    res.json(sendBlock);
  });
}

if(authlevel == 1 || authlevel == 2){
  router.post('/addBlock', function(req, res) {
    bc.loadFromFile();
    var user = req.body.user.replace("%20", " ");
    var pass = req.body.pass;
    console.log(req.body);
    var text = fs.readFileSync('users.txt','utf8');
    var users = JSON.parse(text);
    for (var i = 0; i < users.length; i++) {
      if(users[i].user === user){
        if(users[i].pass === pass){
          var block = req.body.block;
          console.log(block);
          var rawBlock = JSON.parse(block);
          rawBlock.index = bc.getLatestBlock().index + 1;
            //rawBlock = rawBlock.replace(" ", "");
            bc.addBlock(rawBlock);
            bc.saveToFile();
            //console.log(block);
            res.send("200");
        }else{
          res.send("401");
        }
      }else{
        res.send("401");
      }
    }
  });
}
else{
  router.post('/addBlock', function(req, res) {
    bc.loadFromFile();
    var block = req.body.block;
    console.log(block);
    var rawBlock = JSON.parse(block);
      if(rawBlock.index == bc.chain.length){
      //rawBlock = rawBlock.replace(" ", "");
      bc.addRawBlock(rawBlock);
      bc.saveToFile();
      //console.log(block);
      res.send("200");
    }
  });
}



// more routes for our API will happen here
/*router.get('/getLatestBlock', function(req, res) {
  bc.loadFromFile();
  var text = JSON.stringify(bc.chain);
  var blocks = JSON.parse(text);
  res.send(blocks[blocks.length - 1]);
  //console.log("ser", blocks[blocks.length - 1]);
  /*fs.readFile('./blockchain.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
      //console.log(data);
      res.send(data);
    });

});*/


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);


//the end
