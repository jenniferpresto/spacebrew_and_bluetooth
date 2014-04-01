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

  // noble.on('stateChange', function(state) {

    if (not_init) {
      // setup spacebrew
      var sb = new Spacebrew.Client();  // create spacebrew client object

      sb.name("BLUETOOTH");
      sb.description("This app sends text from an HTML form."); // set the app description

      // create the spacebrew subscription channels
      sb.addPublish("text", "string", "");  // create the publication feed
      sb.addSubscribe("text", "string");    // create the subscription feed

      // configure the publication and subscription feeds
      sb.onStringMessage = function () { console.log("onStringMessage") };   
      sb.onOpen = function () { console.log("onOpen") };

      // connect to spacbrew
      sb.connect();  

      not_init = false;
    }

    // console.log('stateChange function called');
    // if (state === 'poweredOn') {
    //   console.log('state is powered on');
    //   noble.startScanning();
    // } else {
    //   noble.stopScanning();
    //   console.log("scanning stopped");
    // }

    // if (state === 'unknown') {
    //   console.log('state is unknown');
    // }

    // if (state === 'resetting') {
    //   console.log('state is resetting');
    // }

    // if (state==='unsupported') {
    //   console.log('state is unsupported');
    // }

    // if (state==='unauthorized') {
    //   console.log('state is unauthorized');
    // }

  // }); // end of noble statechange function
} // end of ConnectSpacebrew() function

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
        // there are four discoverable services; the one below is always the third one
        peripheral.discoverServices(['713d0000503e4c75ba943148f18d941e'], function(error, services) {
          console.log('discovered service from RedBear BLE shield.');
          console.log('its size is: ' + services.size);
          var characteristics = services[0].discoverCharacteristics(null, function(error, characteristics) {
            console.log('discovered the following characteristics');
            if (connectedSocket !== undefined) {
              // var stringifiedCharacteristics = characteristics.stringify();
              // connectedSocket.emit('characteristic', characteristics);
              util.log('this is where we would have sent info');
            }
            for (var i in characteristics) {

              console.log( ' ' + i + ' uuid: ' + characteristics[i].uuid);
              console.log(' ' + i + ' name: ' + characteristics[i].name);
              var currentCharacteristic = characteristics[i];

              // if (connectedSocket !== undefined) {
              //   connectedSocket.emit('characteristic', characteristics[i]);
              //   util.log('sending info');
              // }

              currentCharacteristic.read(function(error, data) {
                console.log('reading data: ', data);
              })
            }
          })
        })
      });
    } // end of if-statement to make sure connecting only to BLE-SHIELD
  });
} // end of InitializeBluetooth() function
