

#include <SPI.h>
#include <boards.h>
#include <ble_shield.h>
#include <services.h>

const int buttonPin = 2;
int buttonState = 0;

void setup(){
  ble_set_name("BLE_GUS");
  
  pinMode(buttonPin, INPUT);     

  //starts the BLE LIBRARY
  ble_begin(); 

  Serial.begin(57600);

}

void loop(){  
  buttonState = digitalRead(buttonPin);
  if (buttonState == HIGH) {     
    Serial.println('hello'); 
  } 
  else {
    Serial.println('good bye');
  }

  
  while ( ble_available() ){
    Serial.write(ble_read());
  }
  while ( Serial.available() ){
    
    Serial.println('hello world');
    
    ble_write(0x48); //H
    delay(1000); 
    ble_write(0x65); //e
    delay(1000);
    ble_write(0x6C); //l
    delay(1000);
    ble_write(0x6C); //l
    delay(1000);
    ble_write(0x6F); //o
    delay(1000);
    
    ble_write(0x57); //W
    delay(1000); 
    ble_write(0x6F); //o
    delay(1000);
    ble_write(0x72); //r
    delay(1000);
    ble_write(0x6C); //l
    delay(1000);
    ble_write(0x64); //d
    delay(1000);
  }

  
  ble_do_events();  
  
}

