class BLEShield {
  PVector pos, vel, accel;
  float maxSpeed;
  String name;
  float avgRSSI;
  float maxRSSI, minRSSI;

  boolean buttonDown;
  boolean initialized;
  float h, s, b;
  float diameter;
  float maxDiameter, minDiameter;


  float timeLastNote;
  float timeLastCustomMessage;
  float repulsionRadius;

  //---------------------------
  // Constructor
  //---------------------------
  BLEShield() {
    maxDiameter = 400;
    minDiameter = 180;
    diameter = minDiameter;
    float radius = diameter/2;
    repulsionRadius = radius * 1.5;

    pos = new PVector(random(radius, width-radius), random(radius, height-radius));
    vel = new PVector(0, 0);
    accel =new PVector(0, 0);
    maxSpeed = 2.5;

    name = "";
    maxRSSI = 65;
    minRSSI = 45;
    avgRSSI = maxRSSI; // start big (which means small, since we take abs of rssi)
    buttonDown = false;
    initialized = false;
    h = random(215, 265);
    s = 50;
    b = 50;

    timeLastNote = 0;
    timeLastCustomMessage = millis();
  }

  //---------------------------
  // Methods
  //---------------------------
  void update() {
    // ease toward new diameter
    float targetDiameter = map(avgRSSI, maxRSSI, minRSSI, maxDiameter, minDiameter);
    // clamp targetDiameter
    if (targetDiameter > maxDiameter) {
      targetDiameter = maxDiameter;
    } 
    else if (targetDiameter < minDiameter) {
      targetDiameter = minDiameter;
    }
    diameter = (0.9 * diameter) + (0.1 * targetDiameter);
    // generally easing toward more neutral colors (will change when sounds are played
    s = (s * 0.9) + (50 * 0.1);
    b = (b * 0.9) + (50 * 0.1);

    if (initialized && (millis() - timeLastCustomMessage > 2000)) {
      initialized = false;
    }

    // movement
    float radius = diameter/2;

    if (pos.y < height - radius) {
      addGravity();
    } 
    else {
      accel.y -= 0.2;
    }

    repulsionRadius = radius * 1.5;
    if (pos.x < repulsionRadius || pos.x > width - repulsionRadius ||  pos.y < repulsionRadius) {
      attractToCenter();
    }

    vel.add(accel);
    vel.limit(maxSpeed);
    pos.add(vel);
    accel.set(0, 0);
  }

  //---------------------------
  void playMusic(int index) {
    if (initialized && buttonDown) {
      // get speed of notes, based on RSSI
      float notesPerSecond = map(avgRSSI, 55, 45, 3, 10);
      // clamp the results
      if (notesPerSecond < 3) {
        notesPerSecond = 3;
      } 
      else if (notesPerSecond > 10) {
        notesPerSecond = 10;
      }

      float millisNextNote = 1000/notesPerSecond;

      // if it's time to play a new note
      if (millis() - timeLastNote > millisNextNote) {
        // select anchor pitch based on RSSI
        float pitch = map(avgRSSI, maxRSSI, minRSSI, 2, 22);
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

        diameter *= 1.1;

        float revNormalizedPitch = map(pitch, 2, 22, 2.5, 1.5);
        // propel the bubble up a little bit (and to the side)
        accel.x += random(-2.0, 2.0);
        accel.y -= 4.5 * revNormalizedPitch; // propel upwards more on lower notes (since fewer)
      }
    }
  }

  //---------------------------
  void visualize() {
    if (!initialized) {
      fill(100);
      ellipse(pos.x, pos.y, diameter, diameter);
    }     
    else {
      // make a gradient based on existing saturation, brightness, and diameter
      int numCircles = 30;
      println("saturation is : " + s);
      for (int i = 0; i < numCircles; i++) {
        float tempCol;
        tempCol = map(i, 0, numCircles, 0, s);
        fill(h, tempCol, b);
        float tempDiameter = diameter - ((i*diameter)/numCircles);
        ellipse(pos.x, pos.y, tempDiameter, tempDiameter);
      }
      fill(200);
      text(name, pos.x, pos.y);
    }
  }

  //---------------------------
  void repulse(PVector fromPoint) {
    PVector diff = PVector.sub(pos, fromPoint);
    if (diff.magSq() < repulsionRadius * repulsionRadius) {
      float strength = 1-(diff.mag() / repulsionRadius);
      diff.normalize();
      diff.mult(strength * 2.0);
      accel.add(diff);
    }
  }

  //---------------------------
  void addGravity() {
    accel.y += 0.1;
  }

  //---------------------------
  void attractToCenter() {
    PVector center = new PVector(width/2, height/2);
    PVector desired = PVector.sub(center, pos);
    desired.normalize();
    desired.mult(0.7);
    accel.add(desired);
  }
}

