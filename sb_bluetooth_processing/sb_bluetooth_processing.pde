//import ddf.minim.spi.*;
//import ddf.minim.signals.*;
//import ddf.minim.analysis.*;
//import ddf.minim.ugens.*;
//import ddf.minim.effects.*;

// Spacebrew
import spacebrew.*;
String server = "sandbox.spacebrew.cc";
String name="Processing subscribe-side app";
String description = "Subscribe-side app that visualizes and audio-izes info from Bluetooth";
Spacebrew sb;

// Audio
import ddf.minim.*;
Minim minim;
AudioSample[] xyloNotes = new AudioSample[25];
AudioSample[] violinNotes = new AudioSample[25];

// information from BLE Shields
BLEShield[] shields = new BLEShield[2];

void setup() {
  // setting up basic view
  size(600, 400);
  background(0);

  // Spacebrew setup
  sb = new Spacebrew(this);
  sb.addSubscribe("rssi", "rssi_info");
  sb.addSubscribe("button", "button_info");

  sb.connect(server, name, description);

  // Shield objects in Processing
  for (int i = 0; i < 2; i++) {
    shields[i] = new BLEShield();
  }
  // arbitrarily assign names of two shields
  shields[0].name = "BLE_GUS";
  shields[1].name = "BLE_JGP";

  // Audio setup
  minim = new Minim(this);

  for (int i = 0; i < 25; i++) {
    xyloNotes[i] = minim.loadSample("xylo" + i + ".wav", 512);
    violinNotes[i] = minim.loadSample("violin" + i + ".wav", 512);
  }
}

void draw() {
  background(0);
  fill(255, 100, 100);

  for (int i = 0; i < 2; i++) {
    shields[i].update();
    shields[i].visualize();

    //    if (shields[i].initialized) {
    //      
    //      ellipse(i * 1/2 * width/2, height/2, shields[i].avgRSSI, shields[i].avgRSSI);
    //    }
  }
}

void onCustomMessage ( String name, String type, String value) {
  JSONObject receivedData = JSONObject.parse(value);
  String deviceName = receivedData.getString("deviceName");
  println("deviceName = " + deviceName);

  // first, trip a flag if the device has been discovered at all
  if (deviceName.equals("BLE_GUS")) {
    shields[0].initialized = true;
  } 
  else if (deviceName.equals("BLE_JGP")) {
    shields[1].initialized = true;
  }

  // check to see if button is down or up
  if (type.equals("button_info")) {
    println("buttonData: " + receivedData);
    if (deviceName.equals("BLE_GUS")) {
      if (receivedData.getInt("buttonValue") == 255) {
        shields[0].buttonDown = true;
      } 
      else {
        shields[0].buttonDown = false;
      }
    } 
    else if (deviceName.equals("BLE_JGP")) {
      if (receivedData.getInt("buttonValue") == 255) {
        shields[1].buttonDown = true;
      } 
      else {
        shields[1].buttonDown = false;
      }
    }
  } 

  // or check to see if receiving rssi info
  else if (type.equals ("rssi_info")) {
    println("rssiData: " + receivedData);
    if (deviceName.equals("BLE_GUS")) {
      shields[0].avgRSSI = abs(float(receivedData.getString("rssiValue")));
    } 
    else if (deviceName.equals("BLE_JGP")) {
      println("named device correctly?");
      shields[1].avgRSSI = abs(float(receivedData.getString("rssiValue")));
      println("avgRSSI is what? " + shields[1].avgRSSI);
    }
  }
}

void keyPressed () {
  if (key == ' ') {
    int ranNote = int(random(0, 24));
    xyloNotes[ranNote].trigger();
  }
  
  if (key == 'v') {
    int ranNote = int(random(0, 24));
    violinNotes[ranNote].trigger();
  }
}

