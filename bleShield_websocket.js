/*****************************

The following code is adapted from the advertisement-discovery.js example
from the noble library, available here:
https://github.com/sandeepmistry/noble

*****************************/

// creating socket.io connection
var util = require('util');
var connect = require('connect');
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


noble.on('stateChange', function(state) {
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
  console.log('here!');
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
    console.log('peripheral connected: ' + peripheral.advertisement.localName);
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
  })

});

noble.on('connect', function(peripheral) {
  console.log('peripheral connected; separate function');
});