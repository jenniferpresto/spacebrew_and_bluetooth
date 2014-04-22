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

// Connect Spacebrew, which also initialize the Bluetooth
ConnectSpacebrew();

// Spacebrew
function ConnectSpacebrew() {
  var not_init = true;

    if (not_init) {
      // setup spacebrew
      // var sb = new Spacebrew.Client();  // create spacebrew client object

      sb.name("BLUETOOTH");
      sb.description("This app routes information from an arduino BLE Shield."); // set the app description

      // create the spacebrew subscription channels
      sb.addPublish("text", "string", "");  // create the publication feed
      // sb.addSubscribe("text", "string");    // create the subscription feed

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
function onStringMessage(name, value) {
  // message to terminal console
  console.log("Receiving Spacebrew string message");
  console.log("Value is ", value);
  // message to browser via socket
  // connectedSocket.emit('from spacebrew with love', value);
  // console.log('sent value via websockets to browser');
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
  console.log('initializing bluetooth discover function');
  noble.on('discover', function(peripheral) {
    console.log('peripheral discovered (' + peripheral.uuid+ '):');
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

    // if the device is the RedBear BLE shield, connect
    if (peripheral.uuid === 'd49abe6bfb9b4bc8847238f760413d91') {
      peripheral.connect(function(error) {
        console.log('Connected to ', peripheral.advertisement.localName);

        // discover the service on which transmission will happen
        peripheral.discoverServices(['713d0000503e4c75ba943148f18d941e'], function(error, services) {
          console.log('discovered service: ' + services[0].uuid);

          // discover notify characteristic (where we read tx from BLE device)
          services[0].discoverCharacteristics(['713d0002503e4c75ba943148f18d941e'], function (error, characteristics) {
            console.log('discovered characteristic: ', characteristics[0]);
          })
        })

        setInterval(function () {
          peripheral.updateRssi(function(error, rssi) {
            console.log('inside rssi update function for BLE-GUS device');
            if (error) {
              console.log("the error: " + error);
            }
            console.log("Rssi for " + peripheral.localName + ": " + rssi.toString());
            var ble_signal = Math.abs(rssi.toString());
            sb.send("text", "string", ble_signal);
          });
        }, 1000);
      });
    } // end of if-statement to make sure connecting only to BLE-GUS


    // if statement to connect to BLE-JGP
    if (peripheral.uuid === '9e2aab25f29d49078577c1559f8f343d') {
      peripheral.connect(function(error) {
        console.log('Connected to ', peripheral.advertisement.localName);

        // discover the service on which transmission will happen
        peripheral.discoverServices(['713d0000503e4c75ba943148f18d941e'], function(error, services) {
          console.log('discovered service: ' + services[0].uuid);

          // discover notify characteristic (where we read tx from BLE device)
          services[0].discoverCharacteristics(['713d0002503e4c75ba943148f18d941e'], function (error, characteristics) {
            console.log('discovered characteristic: ', characteristics[0]);
            var txCharacteristic = characteristics[0];
            txCharacteristic.notify(true, function(error) {
              console.log('notification is on');
              // callback to read data
              txCharacteristic.on('read', function(data, isNotification) {
                console.log('reading data: ', data);
              })
            });
            console.log('hit notify function');
            console.log('now read function');
            txCharacteristic.read(function(error, data) {
              // console.log('data is ', data.toString('utf8'));
            });
            console.log('now on read');
            txCharacteristic.on('read', function(data, isNotification) {
              console.log('reading data!: ', data);
            })
          })
        })

        // setInterval(function () {
        //   peripheral.updateRssi(function(error, rssi) {
        //     console.log('inside rssi update function for BLE-JENNIFER device');
        //     if (error) {
        //       console.log("the error: " + error);
        //     }
        //     console.log("Rssi for " + peripheral.advertisement.localName + ": " + rssi.toString());
        //     var ble_signal = Math.abs(rssi.toString());
        //     sb.send("text", "string", ble_signal);
        //   });
        // }, 1000);

        // peripheral.discoverServices(['713d0000503e4c75ba943148f18d941e'], function(error, services) {
        //   console.log('services discovered: length is ' + services.length);
        //   console.log('services: ' + services[0]);
        //   services[0].discoverCharacteristics(null, function(error, allCharacteristics) {
        //     console.log('characteristics length: ' + allCharacteristics.length);
        //     console.log('characteristic0' + allCharacteristics[0]);
        //     console.log('characteristic1' + allCharacteristics[1]);
        //     allCharacteristics[0].read(function(error, data) {
        //       console.log('data0', data);
        //     });
        //     allCharacteristics[1].read(function(error, data) {
        //       console.log('data1', data);
        //     });
        //   })
        // })
      });
    } // end of if-statement to make sure connecting only to BLE-JGP

    // if-statement for fitbit is for fitbit
    // if (peripheral.uuid === '711dcc109ff1434a80dcfdbf9e62d49e') {
    //   peripheral.connect(function(error) {
    //     console.log('Connected to ', peripheral.advertisement.localName);

    //     setInterval(function () {
    //       peripheral.updateRssi(function(error, rssi) {
    //         console.log('inside rssi update function for FLEX device');
    //         if (error) {
    //           console.log("the error: " + error);
    //         }
    //         console.log("Rssi for " + peripheral.localName + ": " + rssi.toString());
    //         sb.send("text", rssi.toString());
    //       });
    //     }, 1000);
    //   });
    // } // end of if-statement about FLEX device

  });
} // end of InitializeBluetooth() function
