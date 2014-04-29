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

// fonts
PFont century;

void setup() {
  // setting up the basics
//  size(600, 400);
  size(displayWidth, displayHeight);
  background(0);
  colorMode(HSB, 360, 100, 100);
  noStroke();

  // Spacebrew setup
  sb = new Spacebrew(this);
  sb.addSubscribe("rssi", "rssi_info");
  sb.addSubscribe("button", "button_info");

  sb.connect(server, name, description);

  // Audio setup
  minim = new Minim(this);

  for (int i = 0; i < 25; i++) {
    xyloNotes[i] = minim.loadSample("xylo" + i + ".wav", 512);
    violinNotes[i] = minim.loadSample("violin" + i + ".wav", 512);
  }


  // Shield objects in Processing
  for (int i = 0; i < 2; i++) {
    shields[i] = new BLEShield();
  }
  // arbitrarily assign names of two shields
  // (since we know in advance what they'll be)
  shields[0].name = "BLE_GUS";
  shields[1].name = "BLE_JGP";

  // fonts
  textAlign(CENTER);
  century = loadFont("CenturyGothic-24.vlw");
  textFont(century);
}

void draw() {
<<<<<<< HEAD
  
  println("frameRate: " + frameRate);
//  background(0);
//  fill(255, 100, 100);
  
  fill(206, 85, 73, 20);
  rect(0, 0, width, height);

=======
//  println("frameRate: " + frameRate);
  background(0);
  fill(255, 100, 100);
>>>>>>> bbf884724b7ee68bb8d6debc24f7423545ac62b9

  for (int i = 0; i < 2; i++) {
    shields[i].update();
    shields[i].playMusic(i); // pass index number so know which tones to play
    shields[i].visualize();
  }

  // make the two dots gently repel each other
  shields[0].repulse(shields[1].pos);
  shields[1].repulse(shields[0].pos);
}

// this function called when sketch receives a message from Spacebrew
// we are sending two custom data types from the node application:
// "button_info" and "rssi_info"
// both types have an element called "deviceName," so we parse that first
void onCustomMessage ( String name, String type, String value) {
  JSONObject receivedData = JSONObject.parse(value);
  String deviceName = receivedData.getString("deviceName");
  int index = 0;

  // first, trip a flag if the device has been discovered at all
  if (deviceName.equals("BLE_GUS")) {
    shields[0].initialized = true;
    index = 0;
  } 
  else if (deviceName.equals("BLE_JGP")) {
    shields[1].initialized = true;
    index = 1;
  }

  // check to see if button is down or up
  if (type.equals("button_info")) {
//    println("buttonData: " + receivedData);
    if (receivedData.getInt("buttonValue") == 0) {
      shields[index].buttonDown = true;
    } 
    else {
      shields[index].buttonDown = false;
    }
  } 

  // or check to see if receiving rssi info
  else if (type.equals ("rssi_info")) {
    //    println("rssiData: " + receivedData);
    // Data arrives as a string within a JSON Object;
    // convert it to a float. 
    shields[index].avgRSSI = abs(float(receivedData.getString("rssiValue")));
  }

  // update time stamp so we can make sure we're still getting data
  shields[index].timeLastCustomMessage = millis();
}

// keypress is for debugging (and for just hearing nice sounds if you like)
void keyPressed () {
  if (key == ' ') {
    int ranNote = floor(random(0, 24.99));
    xyloNotes[ranNote].trigger();
    println("xylo: " + ranNote);
  }

  if (key == 'v') {
    int ranNote = floor(random(0, 24.99));
    violinNotes[ranNote].trigger();
    println("violin: " + ranNote);
  }
}
