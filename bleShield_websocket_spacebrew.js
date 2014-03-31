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
var Spacebrew = require('./spacebrew.js').Spacebrew;
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
})

// bluetooth connection
var noble = require('noble');

// ws websocket stuff
// var WebSocketServer = require('ws').Server;
// var wss = new WebSocketServer({port:5000});

// var ws; // connection back to client

// wss.on('connection', function(socket) {
//     console.log("WebSocket client connected");
//     ws = socket;
// });

var not_init = true;

noble.on('stateChange', function(state) {

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

  console.log('stateChange function called');
  if (state === 'poweredOn') {
    console.log('state is powered on');
    noble.startScanning();
  } else {
    noble.stopScanning();
    console.log("scanning stopped");
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

});


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

  // automatically connect to a peripheral that is discovered

  peripheral.connect(function(stuff) {
    console.log('peripheral connected:', peripheral.advertisement.localName);
    console.log('full information', peripheral.advertisement);
    // if we have a connection, send to the ws client
    // if (ws) {
    //   ws.send('name', peripheral.advertisement.localName);
    //   ws.send('uuid', peripheral.uuid);
    // }

    if (connectedSocket !== undefined) {
      connectedSocket.emit('peripheral_info', peripheral.advertisement);
      util.log('sending info');
    }

    peripheral.discoverServices(['180a'], function(error, services) {
      var deviceInformationService = services[0];
      console.log('discovered device information service');

      deviceInformationService.discoverCharacteristics(null, function(error, characteristics) {
        console.log('discover the following characteristics: ');
        for (var i in characteristics) {
          console.log('  ' + i + 'uuid: ' + characteristics[i].uuid);
        }
      });
    });
  });

});
