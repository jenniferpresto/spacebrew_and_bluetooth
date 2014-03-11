/* ****************************

Beginnings of attempt to connect bluetooth serial port module and Spacebrew.
This file deals only with Spacebrew so far.

**************************** */

window.onload = function () {

	var sb;
	var app_name = "Test App";

	// connect to localhost at port 5000
	var ws = new WebSocket('ws://127.0.0.1:5000');

	ws.onopen = function (event) {
		console.log("we're in!");
	}

	function setup() {

		// websocket connection
		// socket = io.connect(window.location.hostname)


		// Spacebrew
		sb = new Spacebrew.Client({reconnect:true});

		sb.name = app_name;
		sb.description("Shell application");

		sb.addPublish ( "boolPublisher", "boolean", "false" );
		sb.addSubscribe ( "boolSubscriber", "boolean" );

		sb.onBooleanMessage = onBooleanMessage;
		sb.onCustomMessage = onCustomMessage;

		// connect to Spacebrew
		sb.connect();

		function onBooleanMessage ( name, value ) {

		}

		function onCustomMessage ( name, value, type ) {

		}

	}

	// kick things off
	setup();

}