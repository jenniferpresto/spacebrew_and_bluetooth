class BLEShield {
  String name;
  float avgRSSI;
  boolean buttonDown;
  boolean initialized;
  
  BLEShield() {
    name = "";
    avgRSSI = 0.0;
    buttonDown = false;
    initialized = false;
  }
}
