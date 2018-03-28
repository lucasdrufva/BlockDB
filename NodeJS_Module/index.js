var ip = "";
var user = "";
var pass = "";
var authlevel = 0;
const SHA256 = require("crypto-js/sha256");
var request = require('request');
var querystring = require('querystring');
var deasync = require('deasync');

exports.connect = function (ips, users, passw) {
    ip = 'http://' + ips;
    user = users;
    pass = SHA256(passw).toString();
    request(ip + '/api/authlevel', function (error, response, body) {
      authlevel = parseInt(body);
    });
};

function writes(names, datatypes, datas, callback) {
  block = {name: names, datatype: datatypes, data: datas};
  console.log(block);
  //if(authlevel == 1 || authlevel == 2){
  var form = {
    block:  JSON.stringify(block),
    user: user,
    pass: pass
  };
  var formData = querystring.stringify(form);
  var contentLength = formData.length;
  request({
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: ip + '/api/addBlock',
    body: formData,
    method: 'POST'
  }, function (err, res, body) {
    callback(res);
  });
  //}
};

exports.write = function (names, datatypes, datas){
    var ret = null;
    writes(names, datatypes, datas, function(res){
      ret = res
    });

    while((ret == null))
    {
         deasync.runLoopOnce();
    }

    return ret;
}

function reads(name, callback){
  var block;
  var responsee = null;
  request(ip + '/api/getBlockName/' + user + '/' + pass + '/' + name, function (error, response, body) {
    block = JSON.parse(body);
    callback(block);
  });
  //return callback(responsee);
}

exports.read = function(name){
  var ret = null;
  reads(name, function(res){
    ret = res
  });

  while((ret == null))
  {
       deasync.runLoopOnce();
  }

  return ret;
}