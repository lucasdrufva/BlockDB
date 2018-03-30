BlockDB
=========

A blockchain based database

This is the node module to interact with a BlockDB server

## Usage

```js
#Import module
var blockdb = require('blockdb');

#Connect to server
blockdb.connect(ip, username, password);

#Write to database
blockdb.write(name, datatype, data);

#Read from database
var data = blockdb.read(name).data;

```