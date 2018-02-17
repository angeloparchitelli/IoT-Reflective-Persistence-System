/*
 *  Arduino code that allows to read temperature and humidity from
 *  DHT sensor
 *  The output is a JSON data format
 */
 
#include <math.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Time.h>  

// Define temperature sensor PIN
#define DHT22_PIN 2
#define DHTTYPE DHT22 

// Define Time Library
#define TIME_MSG_LEN  11
#define TIME_HEADER  'T'
#define TIME_REQUEST  7

#define DEBUG  1

DHT dht(DHT22_PIN, DHTTYPE);


void setup() {
  Serial.println("[!] Init");
  Serial.begin(9600);
  
}

void loop() {
  if(Serial.available() ) {
    processSyncMessage();
  }
  if ( timeStatus() == timeNotSet ) {
    Serial.println("[!] Sync timer message: T[Unix_timestamp]");
    delay(1000);
  } else {
      time_t t = now();
      read_send_data_fromSensor(t);
      delay(10000);
  }
  

}

void processSyncMessage() {
  while(Serial.available() >=  TIME_MSG_LEN ){  
    char c = Serial.read() ; 
    Serial.print(c);  
    if( c == TIME_HEADER ) {       
      time_t pctime = 0;
      for(int i=0; i < TIME_MSG_LEN -1; i++){   
        c = Serial.read();          
        if( c >= '0' && c <= '9'){   
          pctime = (10 * pctime) + (c - '0') ; 
        }
      }   
      setTime(pctime);   
    }  
  }
}


void read_send_data_fromSensor(time_t timestamp) {
  //if (DEBUG==1) Serial.println("Ready to read sensors data");
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& root = jsonBuffer.createObject();
  root["sensor"] = "temperature_humidity";
  root["unix_timestamp"] = timestamp;
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  JsonArray& data = root.createNestedArray("data");
  data.add(t, 1);  
  data.add(h, 1);  
  root.printTo(Serial); 
}

