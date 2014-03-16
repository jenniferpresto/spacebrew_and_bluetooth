// var noble = require('../index');
var noble = require('noble');

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port:5000});

var ws; // connection back to client

wss.on('connection', function(socket) {
    console.log("WebSocket client connected", socket);
    ws = socket;
});


noble.on('stateChange', function(state) {
  console.log('noble.on function called');
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

  peripheral.connect(function(stuff) {
    console.log('peripheral connected: ' + peripheral.advertisement.localName);
    ws.send(stuff);
  })

  console.log();
});

noble.on('connect', function(peripheral) {
  console.log('peripheral connected');
});