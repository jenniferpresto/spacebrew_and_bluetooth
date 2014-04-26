/*****************************

The following is a bare-bones implementation of the noble.js
library with the Spacebrew toolkit. Certain code adapted from the advertisement-discovery.js example
from the noble library, available here:
https://github.com/sandeepmistry/noble

Helpful examples on wiki here:
https://github.com/sandeepmistry/noble/wiki/Getting-started

*****************************/

// Spacebrew connection
var Spacebrew = require('./spacebrew.js').Spacebrew;
// bluetooth connection
var noble = require('noble');

var port = process.env.PORT || 5000;

// make this a global variable so can be accessed within multiple parts of the app
var sb = new Spacebrew.Client();

// Connect Spacebrew, which also initializes the Bluetooth
ConnectSpacebrew();


// variables for calculating average within Bluetooth function
var numberArrayBLE1 = []; // for Gus BLE Shield
var numberArrayBLE2 = []; // for Jennifer BLE Shield


// Spacebrew
function ConnectSpacebrew() {
  var not_init = true;

    if (not_init) {
      // setup spacebrew
      sb.name("BLUETOOTH");
      sb.description("This app routes information from two arduino BLE Shields."); // set the app description

      // create the spacebrew subscription channels
      // sb.addPublish("text", "string", "");  // create the publication feed
      // // sb.addSubscribe("text", "string");    // create the subscription feed
      // sb.addPublish("button", "boolean", false); // create boolean for button press

      // add custom data type for rssi and for button
      sb.addPublish("rssi", "rssiInfo", {deviceName:"", rssiValue:0});
      sb.addPublish("button", "buttonInfo", {deviceName: "", buttonValue:0});

      sb.onStringMessage = onStringMessage;

      sb.onOpen = function (){
        console.log("Spacebrew is open");
        // initialize Bluetooth connection only after Spacebrew is open 
        // callback(InitializeBluetooth);
        InitializeBluetooth();
      };

      // connect to spacebrew
      sb.connect();  

      not_init = false;
    }
} // end of ConnectSpacebrew() function

// Called when Spacebrew receives a string message
// (not called in this particular app, because only sending messages, not receiving)
function onStringMessage(name, value) {
  // message to terminal console
  console.log("Receiving Spacebrew string message");
  console.log("Value is ", value);
}

// bluetooth (called within ConnectSpacebrew function)
function InitializeBluetooth() {

  // because this doesn't get called until after the Spacebrew connection
  // is made, if bluetooth is already on, there's no state change, and
  // the 'stateChange' function doesn't get called

  // therefore, just start scanning as soon as it's called
  noble.startScanning();
  console.log('started scanning');

  // state change of bluetooth causes computer to scan for devices
  // report to terminal console what the state change is
  noble.on('stateChange', function(state) {
    console.log('stateChange function called');

    // if state changes to on, always start scanning; otherwise, stop
    if (state === 'poweredOn') {
      console.log('state is powered on');
      noble.startScanning();
      console.log('started scanning');
    } else {
      noble.stopScanning();
      console.log('scanning stopped');
    }

    if (state === 'unknown') {
      console.log('state is unknown');
    }

    if (state === 'resetting') {
      console.log('state is resetting');
    }

    if (state==='unsupported') {
      console.log('state is unsupported');
    }

    if (state==='unauthorized') {
      console.log('state is unauthorized');
    }
  }); // end of noble statechange function

  // following function called when noble detects any BLE device
  // prints to console name, services, etc. 
  console.log('initializing bluetooth discover function');
  noble.on('discover', function(peripheral) {
    console.log('peripheral discovered (' + peripheral.uuid + '):');
    console.log('\thello my local name is:');
    console.log('\t\t' + peripheral.advertisement.localName);
    console.log('\tcan I interest you in any of the following advertised services:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));
    if (peripheral.advertisement.serviceData) {
      console.log('\there is my service data:');
      console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceData.toString('hex')));
    }
    if (peripheral.advertisement.manufacturerData) {
      console.log('\there is my manufacturer data:');
      console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
    }
    if (peripheral.advertisement.txPowerLevel !== undefined) {
      console.log('\tmy TX power level is:');
      console.log('\t\t' + peripheral.advertisement.txPowerLevel);
    }

    // if the device is either of the two RedBear BLE shields -- GUS or JGP -- connects
    if (peripheral.uuid === 'd49abe6bfb9b4bc8847238f760413d91' || peripheral.uuid === '9e2aab25f29d49078577c1559f8f343d') {
      peripheral.connect(function(error) {
        console.log('Connected to ', peripheral.advertisement.localName);

        ReadButtonPress(peripheral);
        UpdateRSSIAndAverage(peripheral);
      });
    } // end of if-statement to make sure connecting only to BLE-GUS
  });
} // end of InitializeBluetooth() function

function Generate_numArr(_rssi, array) {
  //if the array length is smaller than 100
  //delete the first value of the array 
  if(array.length === 100){
    array.splice(0,1);
  }
  
  //push new value to the end of the array
  array.push(_rssi);
};  

//calculate average when you call this function
function CalculateAverage(someArray) {
  var total = 0;
  var averageNum = 0;
  // var i;
  for (var i = 0; i < someArray.length; i++) {
    total += someArray[i];
  }
  averageNum = total / someArray.length;
  return {
    "average" : averageNum,
    "array" : someArray
  };
};

// function to average the RSSI of each peripheral and to send it periodically via Spacebrew
function UpdateRSSIAndAverage (peripheral) {
  // update RSSI every 100th of a second
  setInterval(function () {
    peripheral.updateRssi(function(error, rssi) {
      if (error) {
        console.log("the error: " + error);
      }
      var relevantArray = [];
      // if it's Gus's shield
      if (peripheral.uuid == 'd49abe6bfb9b4bc8847238f760413d91') {
        relevantArray = numberArrayBLE1;
      }
      // if it's Jennifer's shield
      if (peripheral.uuid == '9e2aab25f29d49078577c1559f8f343d') {
        relevantArray = numberArrayBLE2;
      }

      Generate_numArr(rssi, relevantArray);
      var averageResults = CalculateAverage(relevantArray);
      console.log('average results for ' + peripheral.advertisement.localName + ': ', averageResults.average);
      console.log('relevantArray length', averageResults.array.length);

      console.log("Rssi for " + peripheral.advertisement.localName + ": " + rssi.toString());
      var ble_signal = Math.abs(rssi.toString());
      // sb.send("text", "string", ble_signal);
    });
  }, 100);
};

// function to read the button press of the relevant peripheral
function ReadButtonPress(peripheral) {
  // discover the service on which transmission will happen
  peripheral.discoverServices(['713d0000503e4c75ba943148f18d941e'], function(error, services) {
    console.log('discovered service: ' + services[0].uuid);

    // discover notify characteristic (where we read tx from BLE device)
    services[0].discoverCharacteristics(['713d0002503e4c75ba943148f18d941e'], function (error, characteristics) {
      console.log('discovered characteristic: ', characteristics[0]);
      var txCharacteristic = characteristics[0];
      txCharacteristic.notify(true, function(error) {
        console.log('notification is on');
        // callback to read data when shield sends it
        txCharacteristic.on('read', function(data, isNotification) {
          console.log('isNotification: ', isNotification);
          console.log('reading data: ', data);

          // the BLE shields send hex data byte-by-byte, which is received in buffer form.
          // Therefore, use readUInt8(x) to convert to decimal, where x is which byte it's receiving
          // (like the index in an array).
          // Here, we're receiving only one byte, so call only readUInt8(0).
          console.log('reading data UInt8: ', data.readUInt8(0));
          var buttonData = '{\"deviceName\":\"' + peripheral.advertisement.localName + '\", \"buttonValue\":' + data.readUInt8(0).toString() + '}';
          console.log("buttonData: ", buttonData);
          sb.send("button", "buttonInfo", buttonData);
        })
      });
    });
  });
}
