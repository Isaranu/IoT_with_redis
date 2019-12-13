var redis = require('redis');
var iot = redis.createClient();

var RedisSMQ = require('rsmq');
var rsmq = new RedisSMQ({host: "127.0.0.1", port: 6379, ns: "rsmq"});

var Promise = require('promise');

var mongojs = require('mongojs');
var test_redis_db = mongojs('test_redis_db');

var split = require('split-string');

var moment = require('moment');

var qname = "iot";
var qnameexisted_flag = false;

var feedQueuetime = 3; // in-second

var feedMongo_promise = [];

//###### PUB-SUB for IoT connections ######
iot.on('message', function(channel, message){
  console.log('IoT channel : ' + channel + ' | msg = ' + message);
  sendMessage(qname, message); //Feed msg to queue
});

iot.on('subscribe', function(channel, count){
  console.log('iot sub channel : ' + channel + ' | total : ' + count + ' connections');
});

iot.subscribe('iotroom');

// ##### ------- QUEUE management ------- #####

setInterval(function(){
  checkMsgInQueue(qname).then(function(result){
    console.log(result);
    if(result.msgs > 0){

      feedDataToMongo(qname, result);

    }
  }, function(err){
    console.log(err);
  });
},feedQueuetime*1000);

async function queueManagement(){
  await deleteQueue(qname);
  await listQueues().then(function(result){
    if(result.length == 0){
      createQueue(qname);
    }
  }, function(err){
      console.log(err);
  });
}

queueManagement();


// Check hidden msg in queue
/*
setInterval(function(){
  getStat(qname);
  receiveMessage(qname);
},200);
*/
/*
getStat(qname).then(function(result){
  console.log('attr: ' + attr);
}, function(err){
  console.log(err);
});
*/

function feedDataToMongo(_qname, _Qattr){

  console.log('Feed data to record MongoDB = ' + _Qattr.msgs + ' queues.');

  for(var i=0; i<_Qattr.msgs; i++){

    rsmq.popMessage({qname:_qname}, function(err, msgjson){
      var split_arr = [];
      split_arr = split(msgjson.message,{separator:':'});
      var rec_col = test_redis_db.collection(String(split_arr[0]));
          rec_col.insert({
            deviceid: String(split_arr[0]),
            data: Number(split_arr[1]),
            ts: new Date().getTime(),
            ts_pretty: moment(new Date().getTime()).format('Do MMMM YYYY, HH:mm:ss')
          },function(err){
            if(err) return console.log(err);
            console.log('Record data to MongoDB : ' + msgjson.message);
          });
    });

  }
}

function checkMsgInQueue(_qname){
  return new Promise(function(resolve, reject){
    rsmq.getQueueAttributes({qname:_qname}, function(err, attr){
      if(err){
        console.log(err);
        reject(err);
      }else {
        resolve(attr);
      }
    });

  });
}

function listQueues(){
  return new Promise(function(resolve, reject){
    rsmq.listQueues(function(err, qlist){
      if(err){
        reject(err);
      }else {
        console.log(qlist);
        resolve(qlist);
      }
    });
  });
}

function createQueue(_qname){
  return new Promise(function(resolve, reject){
    rsmq.createQueue({qname: _qname}, function(err, resp){
      if(err) reject(err);
      if(resp === 1){
        console.log('New Queue created : ' + qname);
        resolve('New Queue created : ' + qname);
      }
    });
  });
}

function sendMessage(_qname, _msg){
  return new Promise(function(resolve, reject){
    rsmq.sendMessage({qname:_qname, message:_msg}, function(err, resp){
      if(resp){
        console.log('Sent msg to queue name = ' + _qname + ' : ' + resp);
        resolve(resp);
      }else {
        reject(err);
      }
    });
  });
}

function receiveMessage(_qname){
  return new Promise(function(resolve, reject){
    rsmq.receiveMessage({qname:_qname}, function(err, resp){
      if(resp.id){
        console.log('Received msg = ' + JSON.stringify(resp));
        resolve(JSON.stringify(resp));
      }else {
        reject(err);
      }
    });
  });
}

function deleteMessage(_qname, _id){
  return new Promise(function(resolve, reject){
    rsmq.deleteMessage({qname:_qname, id:_id}, function(err, resp){
      if(resp === 1){
        resolve('deleted message');
      }else {
        reject(err);
      }
    });
  });
}

function popMessage(_qname){
  return new Promise(function(resolve, reject){
    rsmq.popMessage({qname:_qname}, function(err, resp){
      if(resp.id){
        console.log('POP msg (received & deleted it from queue) = ' + JSON.stringify(resp));
        resolve(JSON.stringify(resp));
      }else {
        reject(err);
      }
    });
  });
}

function deleteQueue(_qname){
  return new Promise(function(resolve, reject){
    rsmq.deleteQueue({qname:_qname}, function(err){
      if(err){
        console.log(err);
        reject(err);
      }else {
        console.log('Queue : ' + _qname + ' was deleted.');
        resolve('Queue : ' + _qname + ' was deleted.');
      }
    });
  });
}

function getStat(_qname){
  rsmq.getQueueAttributes({qname:_qname}, function(err, attr){
    if(err){
      console.log(err);
    }else {
      console.log(attr);
    }
  });
}
