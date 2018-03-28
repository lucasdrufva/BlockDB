var fs = require('fs');
const SHA256 = require("crypto-js/sha256");
var request = require('request');

class Block {
  constructor(index, name, datatype, data, previousHash = '') {
    this.name = name;
    this.datatype = datatype;
    this.data = data;
    this.index = index;
    this.timestamp = new Date().getTime();
    this.hash = this.calculateHash();
    this.previousHash = previousHash;
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

class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }

    createGenesisBlock() {
        return new Block(0 , "Genesis block", "string", "Genesis block", 0);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.timestamp = new Date().getTime();
        newBlock.hash = SHA256(newBlock.index + newBlock.previousHash + newBlock.timestamp + JSON.stringify(newBlock.data)).toString();
        newBlock.previousHash = this.getLatestBlock().hash;
        this.chain.push(newBlock);
    }

    addRawBlock(newBlock) {
      this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    loadFromFile(){
      var text = fs.readFileSync('blockchain.txt','utf8');
      var blockchain = JSON.parse(text);
      for(let i = 1; i < blockchain.length; i++){
        this.chain[i] = blockchain[i];
      }
    }


    saveToFile(){
      fs.writeFile('blockchain.txt', JSON.stringify(this.chain), function (err) {
        if (err) return console.log(err);
      });
    }
}

const blockchain = new Blockchain();
module.exports = blockchain;
