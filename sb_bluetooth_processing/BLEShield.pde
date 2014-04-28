class BLEShield {
  String name;
  float avgRSSI;
  float posX;
  float posY;
  boolean buttonDown;
  boolean initialized;
  color c;
  float diameter;
  
  BLEShield() {
    name = "";
    avgRSSI = 0.0;
    buttonDown = false;
    initialized = false;
    float r = random(235, 255);
    float g = random(135, 155);
    float b = random(10, 30);
    c = color(r, g, b);
    diameter = 50;
    
    posX = random(20, width-20);
    posY = random(20, height-20);
  }
  
  void update() {
  }
  
  void visualize() {
    if (initialized) {
      fill(c);
    } else {
      fill(100);
    }
    
    ellipse(posX, posY, diameter, diameter);
  }
}
