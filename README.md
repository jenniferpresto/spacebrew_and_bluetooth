###Spacebrew Bluetooth

This repo contains code to (eventually) connect Spacebrew and Bluetooth for the Spacebrew Collab at Parsons, Spring 2014.

See the node noble module on Github [here](https://github.com/sandeepmistry/noble) and on npm [here](https://www.npmjs.org/package/noble).

==========

Uses socket.io connection on server, currently connects to localhost port 5000.

Socket.io node module available on Github [here](https://github.com/LearnBoost/socket.io) and on npm [here](https://www.npmjs.org/package/socket.io).

===


####Basic setup
bleShield_websocket.js runs the node server. In the command line, start the server by navigating to that folder and typing "node bleShield_websocket.js". Then, in your browser, go to "localhost:5000", and it should then connect to the local server and should send a message to the terminal console.

Note that certain modules are included in the node_modules folder and not used, including, for now, async, bluetooth-serial-port, and ws.