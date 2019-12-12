var redis = require("redis"),
    client = redis.createClient();
    iot = redis.createClient();

//###### SIMPLE Code #######
/*
client.on("error", function (err) {
    console.log("Error " + err);
});

client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    //client.quit();
});

client.lrange('Testkey', 0, 100, function(err, reply) {
    console.log(reply);
});
*/

//###### PUB-SUB ######
iot.on('message', function(channel, message){
  console.log(message);
});

iot.on('subscribe', function(channel, count){
  console.log('iot sub channel : ' + channel + ' | total : ' + count + ' connections');
});

iot.subscribe('iotroom');
