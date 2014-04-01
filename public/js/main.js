/* ****************************

Beginnings of attempt to connect bluetooth serial port module and Spacebrew.
This file so far only receives information via sockets from the web server,
which has Bluetooth and Spacebrew functionality incorporated.

**************************** */

window.onload = function () {

	var socket = io.connect(window.location.hostname);

	socket.on('connect', function() {
		console.log('connection created');
	});

	socket.on('peripheral_info', function(data){
		console.log('receiving peripheral info');
		console.log(data);
	});

	socket.on('characteristic', function(data) {
		console.log('received info about characteristics');
		console.log(data);
	});

	socket.on('from spacebrew with love', function(data) {
		console.log('got spacebrew message: ', data);
	});

}