import ddf.minim.spi.*;
import ddf.minim.signals.*;
import ddf.minim.*;
import ddf.minim.analysis.*;
import ddf.minim.ugens.*;
import ddf.minim.effects.*;

import spacebrew.*;

// Spacebrew
import spacebrew.*;
String server = "sandbox.spacebrew.cc";
String name="Processing subscribe-side app";
String description = "visualizing and audio-izing info from Bluetooth";
Spacebrew sb;

void setup() {
  sb = new Spacebrew(this);
  sb.addSubscribe("rssi","rssi_info");
  sb.addSubscribe("button","button_info");
  
  sb.connect(server, name, description);
}

void draw() {
}

void onCustomMessage ( String name, String type, String value) {
  println("onCustomMessage function called");
  println("name: " + name + " type: " + type + " value: " + value);
}
