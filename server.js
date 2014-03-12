/* ****************************

Server to run bluetooth module.

**************************** */

// ---------------------------------
// websocket stuff

// var WebSocketServer = require('ws').Server;
// var wss = new WebSocketServer({port:5000});

// wss.on('connection', function(event) {
//     console.log("WebSocket client connected", event);
// });



// ---------------------------------
// bluetooth serial port stuff
var BTSP;
var btSerial;

BTSP = require('bluetooth-serial-port');
btSerial = new BTSP.BluetoothSerialPort();

btSerial.on('found', function(address, name) {
    console.log('found ', address, ' ', name);
    btSerial.findSerialPortChannel(address, function(channel) {
        btSerial.connect(address, channel, function() {
            console.log('connected');

            btSerial.write(new Buffer('my data', 'utf-8'), function(err, bytesWritten) {
                if (err) console.log(err);
            });

            btSerial.on('data', function(buffer) {
                console.log(buffer.toString('utf-8'));
            });
        }, function () {
            console.log('cannot connect');
        });

        // close the connection when you're ready
        btSerial.close();       
    });
});

btSerial.inquire();
