/*****************************

The following code is adapted from the advertisement-discovery.js example
from the noble library, available here:
https://github.com/sandeepmistry/noble

Helpful examples on wiki here:
https://github.com/sandeepmistry/noble/wiki/Getting-started

*****************************/

// creating socket.io connection
var util = require('util');
var connect = require('connect');
// Spacebrew connection
var Spacebrew = require('./spacebrew.js').Spacebrew;
// bluetooth connection
var noble = require('noble');

var port = process.env.PORT || 5000;

var sb = new Spacebrew.Client();

// create web server
var app = connect.createServer(
connect.static(__dirname + '/public')
).listen(port);

util.log('server running at port: ' + port);

var io = require('socket.io').listen(app);

io.set('log level', 2);

var connectedSocket;
io.sockets.on('connection', function(socket) {
  connectedSocket = socket;

  // connect Spacebrew only after socket connected
  ConnectSpacebrew();
  // discover bluetooth devices only after socket connected (consider making callback from Spacebrew connection)
  InitializeBluetooth();

})

// Spacebrew
function ConnectSpacebrew() {
  var not_init = true;

    if (not_init) {
      // setup spacebrew
      // var sb = new Spacebrew.Client();  // create spacebrew client object

      sb.name("BLUETOOTH");
      sb.description("This app sends text from an HTML form."); // set the app description

      // create the spacebrew subscription channels
      sb.addPublish("text", "string", "");  // create the publication feed
      sb.addSubscribe("text", "string");    // create the subscription feed


      // configure the publication and subscription feeds
      // sb.onStringMessage = function () { console.log("onStringMessage") };

      sb.onStringMessage = onStringMessage;
      sb.onOpen = function () { console.log("Spacebrew is open") };

      // connect to spacbrew
      sb.connect();  

      not_init = false;
    }
} // end of ConnectSpacebrew() function

function onStringMessage(name, value) {
  console.log("Receiving Spacebrew string message");
  console.log("Value is ", value);
  connectedSocket.emit('from spacebrew with love', value);
  console.log('sent value via websockets to browser');
}

// bluetooth
function InitializeBluetooth() {

  // because this doesn't get called until after the socket connection
  // is made, if bluetooth is already on, there's no state change, and
  // the 'stateChange' function doesn't get called

  // therefore, for now, just start scanning
  noble.startScanning();
  console.log('started scanning');

  // state change of bluetooth causes computer to scan for devices
  noble.on('stateChange', function(state) {
    console.log('stateChange function called');

    if (state === 'poweredOn') {
      console.log('state is powered on');
      noble.startScanning();
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

  console.log('starting bluetooth discover function');
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

    // connect to a peripheral if it is the RedBear BLE shield
    if (peripheral.uuid === 'd49abe6bfb9b4bc8847238f760413d91') {

      peripheral.connect(function(stuff) {
        console.log('peripheral connected:', peripheral.advertisement.localName);
        console.log('full information', peripheral.advertisement);
        console.log('peripheral uuid:', peripheral.uuid);

        if (connectedSocket !== undefined) {
          connectedSocket.emit('peripheral_info', peripheral.advertisement);
          util.log('sending info');
        }

        // discover services
        // there are four discoverable services on the BLE Shield; the one below is always the third one
        peripheral.discoverServices(['713d0000503e4c75ba943148f18d941e'], function(error, services) {
          console.log('discovered service from RedBear BLE shield.');
          console.log('its size is: ' + services.size);
          console.log('its rssi is: ', services[0].rssi);
          var characteristics = services[0].discoverCharacteristics(null, function(error, allCharacteristics) {
            console.log('discovered the following characteristics');
            if (connectedSocket !== undefined) {
              // var stringifiedCharacteristics = characteristics.stringify();
              // connectedSocket.emit('characteristic', characteristics);
              util.log('this is where we would have sent info');
            }

            // print uuid for both characteristics in the service
            for (var i in allCharacteristics) {

              console.log( ' ' + i + ' uuid: ' + allCharacteristics[i].uuid);
              console.log(' ' + i + ' name: ' + allCharacteristics[i].name);

              // if (connectedSocket !== undefined) {
              //   connectedSocket.emit('characteristic', characteristics[i]);
              //   util.log('sending info');
              // }

              // note: this is called twice for i=1, never for i=0
              allCharacteristics[i].read(function(error, data) {
                console.log('reading data for characteristic ' + i + ': ', data);
              })
            } // end of for loop


            // NOTE: IF SET INTERVAL IS SET TO ON, SPITS OUT DATA TO CONSOLE LIKE CRAZY AND
            // EVENTUALLY ABORTS
            // setInterval(function() {


              // one characteristic is for reading data from BLE shield
              services[0].discoverCharacteristics(['713d0002503e4c75ba943148f18d941e'], function (error, specificCharacteristic) {
                console.log('specific characteristic');
                console.log(specificCharacteristic);
                console.log('\n');
                console.log('specificCharacteristic _noble');
                console.log('_noble: ', specificCharacteristic[0]._noble);
                // connectedSocket.emit('characteristic', characteristic[0]._noble);
                console.log('\n');
                console.log('_peripherals: ', specificCharacteristic[0]._noble._peripherals);
                console.log('_peripherals specific ID: ', specificCharacteristic[0]._noble._peripherals.d49abe6bfb9b4bc8847238f760413d91);
                console.log('_peripherals specific ID rssi: ', specificCharacteristic[0]._noble._peripherals.d49abe6bfb9b4bc8847238f760413d91.rssi);
                console.log('_properties: ', specificCharacteristic[0]._noble._properties);
                console.log('properties: ', specificCharacteristic[0].properties);
                console.log('rssi: ', specificCharacteristic[0].rssi);


                // try to determine every time this changes ('read' does not work or, at top level, just undefined)
                console.log('\n\ntrying to read rssi as data');
                var mostBasic = specificCharacteristic[0];
                // this winds up as undefined
                mostBasic.read(function(error, data) {
                  console.log(data);
                })

                mostBasic.on('read', function(data, isNotification) {
                  console.log('calling read function');
                  console.log(mostBasic._noble._peripherals.d49abe6bfb9b4bc8847238f760413d91.rssi);
                  console.log(data);
                  var rssiNum = mostBasic._noble._peripherals.d49abe6bfb9b4bc8847238f760413d91.rssi;

                  sb.send("text", "string", rssiNum.toString());
                })

                // console.log(mostBasic._noble._peripherals.d49abe6bfb9b4bc8847238f760413d91.rssi);
              // }, 30000); // end of setInterval()
            })
          }) // end of var characteristics
        })
      });
    } // end of if-statement to make sure connecting only to BLE-SHIELD
  });
} // end of InitializeBluetooth() function
