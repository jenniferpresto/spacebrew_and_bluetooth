#include <SPI.h>
#include <boards.h>
#include <ble_shield.h>
#include <services.h>

void setup(){
  ble_set_name("BLE_GUS");

  //starts the BLE LIBRARY
  ble_begin(); 

  Serial.begin(57600);

}

void loop(){
  while ( ble_available() ){
    Serial.write(ble_read());
  }
  while ( Serial.available() ){
    ble_write('HELLO WORLD');
    delay(1000);
  }

  //allows to send and receive data
  //without this call nothing happens
  ble_do_events();  
}

