#include "ESP8266WiFi.h"

const char *ssid = "your-ssid";
const char *passw = "your-wifi-passw";
#define host "your-ip-address"
#define port 6379

#define redis_password "your-redis-auth"

int cnt=0;
String response;
String deviceid = "wemos_1";

WiFiClient redis;

void authRedis(String authPassword){

  if(redis.connect(host, port)){
    String authStr = "*2\r\n";
           authStr += "$4\r\n";
           authStr += "AUTH\r\n";
           authStr += "$" + String(authPassword.length()) + "\r\n";
           authStr += authPassword + "\r\n";

     Serial.println("Set Redis authen..");
     Serial.println(authStr);

     redis.setNoDelay(false);
     redis.setTimeout(100);
     redis.print(authStr);

     response = "";
     while(redis.available()){
      response = redis.readStringUntil('\n');
     }
     Serial.println("REDIS Server response = " + response);
           
  }
  
}

void pushRedis(String key, String data){
  
  if(redis.connect(host, port)){

    String payload = "*3\r\n";
           payload += "$5\r\n";
           payload += "LPUSH\r\n";
           payload += "$" + String(key.length()) + "\r\n";
           payload += key + "\r\n";
           payload += "$" + String(data.length()) + "\r\n";
           payload += data + "\r\n";
           
    Serial.println(payload);
    redis.print(payload);

    //delay(100);
    
    response = "";
    while(redis.available()){
      response = redis.readStringUntil('\n');
    }
    Serial.println("REDIS Server response = " + response);
    
  }
}

void pubRedis(String channelname, String msg){
  if(redis.connect(host, port)){

    String s_payload = "*3\r\n";
           s_payload += "$7\r\n";
           s_payload += "PUBLISH\r\n";
           s_payload += "$" + String(channelname.length()) + "\r\n";
           s_payload += channelname + "\r\n";
           s_payload += "$" + String(msg.length()) + "\r\n";
           s_payload += msg + "\r\n";
           
    Serial.println(s_payload);
    redis.print(s_payload);

    //delay(100);
    /*
    response = "";
    while(redis.available()){
      response = redis.readStringUntil('\n');
    }
    Serial.println("REDIS Server response = " + response);
    */
  }
}

void setup(){
  
  Serial.begin(115200);
  WiFi.begin(ssid, passw);

  while(WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }

  Serial.println("WiFi connected !");

  authRedis(redis_password);
  
}

void loop(){
  //pushRedis("Testkey",String(cnt));
  pubRedis("iotroom", deviceid + ":" + String(cnt));
  cnt++;
  delay(500);
}
