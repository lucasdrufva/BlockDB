var blockdb = require('./index');

blockdb.connect("localhost:8080", "root", "root");

blockdb.write("test", "string", "It works");
var deasync = require('deasync');

/*function syncFunc()
{
    var ret = null;
    blockdb.read("test", function(response){
      ret = response.data;
    });

    while((ret == null))
    {
         deasync.runLoopOnce();
    }

    return ret;
}
blockdb.read("test", function(response){
  console.log(response.data);
});

console.log(syncFunc());*/
console.log(blockdb.read("test").data);