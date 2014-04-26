/*
Adapted from RedBear SimpleControls example. Attempt to get a simple signal sent from
the shield via BLE signal.
*/

//"services.h/spi.h/boards.h" is needed in every new project
#include <SPI.h>
#include <boards.h>
#include <ble_shield.h>
#include <services.h>
 
#define DIGITAL_IN_PIN     5

void setup()
{

//  ble_set_name("BLE_JGP");
  ble_set_name("BLE_GUS");
  ble_begin();
  
  Serial.begin(9600);
  
//  pinMode(DIGITAL_OUT_PIN, OUTPUT);
  pinMode(DIGITAL_IN_PIN, INPUT);
  
  // Default to internally pull high, change it if you need
  digitalWrite(DIGITAL_IN_PIN, HIGH);
  
}

void loop()
{
  static boolean analog_enabled = false;
  static byte old_state = LOW;
  
//  if (analog_enabled)  // if analog reading enabled
//  {
//    // Read and send out
//    uint16_t value = analogRead(ANALOG_IN_PIN); 
//  }
  
  // If digital in changes, report the state
  if (digitalRead(DIGITAL_IN_PIN) != old_state)
  {
    old_state = digitalRead(DIGITAL_IN_PIN);
    
    if (digitalRead(DIGITAL_IN_PIN) == HIGH)
    { 
      ble_write(0xFF);
      Serial.println(0xFF);
      Serial.println("high");
    }
    else
    {
      ble_write(0x00);
      Serial.println(0x00);
    }
  }
  
  if (!ble_connected())
  {
    analog_enabled = false;
    Serial.println("no ble connection");
  }
  
  // Allow BLE Shield to send/receive data
  ble_do_events();  
}



