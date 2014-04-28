class BLEShield {
  float posX, posY;
  float xVel, yVel;
  String name;
  float avgRSSI;
  boolean buttonDown;
  boolean initialized;
  float h, s, b;
  float diameter;

  float timeLastNote;
  float timeLastCustomMessage;

  BLEShield() {
    posX = random(20, width-20);
    posY = random(20, height-20);
    xVel = 0;
    yVel = 0;

    name = "";
    avgRSSI = 0.0;
    buttonDown = false;
    initialized = false;
    float h = random(300, 360);
    float s = 50;
    float b = 50;

    diameter = 50;

    timeLastNote = 0;
    timeLastCustomMessage = millis();
  }

  void update() {
    // ease toward new diameter
    float targetDiameter = map(avgRSSI, -80, -45, 40, 100);
    diameter = (0.9 * diameter) + (0.1 * targetDiameter);

    // generally easing toward more neutral colors (will change when sounds are played
    s = (s * 0.9) + (50 * 0.1);
    b = (b * 0.9) + (50 * 0.1);
    
    if (initialized && (millis() - timeLastCustomMessage > 2000)) {
      initialized = false;
    }
  }

  void playMusic(int index) {
    if (initialized && buttonDown) {
      // get the range for speed
      float notesPerSecond = map(avgRSSI, 55, 45, 3, 10);
      // clamp the results
      if (notesPerSecond < 3) {
        notesPerSecond = 3;
      } else if (notesPerSecond > 10) {
        notesPerSecond = 10;
      }
      
      float millisNextNote = 1000/notesPerSecond;

      // if it's time to play a new note
      if (millis() - timeLastNote > millisNextNote) {
        // get range for pitch
        float pitch = map(avgRSSI, 55, 45, 2, 22);
        // since accessing an array, must clamp pitch numbers
        if (pitch < 2) {
          pitch = 2;
        }
        if (pitch > 22) {
          pitch = 22;
        }
        
        // pick among a range of 5 notes from the anchor pitch
        int randNote = floor(random(pitch - 2, pitch + 2));
        
        // Gus gets violins
        if (index == 0) {
          violinNotes[randNote].trigger();
        } 
        // Jennifer gets xylophones
        else {
          xyloNotes[randNote].trigger();
        }
        
        timeLastNote = millis();
        
        // visual cue
        s = 100;
        b = 100;
      }
    }
  }

  void visualize() {
    if (initialized) {
      fill(h, s, b);
    } 
    else {
      fill(100);
    }
    ellipse(posX, posY, diameter, diameter);

    if (initialized) {
      fill(200);
      text(name, posX, posY);
    }
  }
}

