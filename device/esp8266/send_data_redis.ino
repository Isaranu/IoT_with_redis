#include "ESP8266WiFi.h"

const char *ssid = "ssid";
const char *passw = "passw";
#define host "<your ip>"
#define port <your port>

#define redis_password "isaranu"

int cnt=0;
String response;

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
  pushRedis("Testkey:abc", "data:" + String(cnt));
  cnt++;
  delay(500);
}
