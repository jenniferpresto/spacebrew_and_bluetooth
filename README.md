###Spacebrew Bluetooth

This repo contains code to (eventually) connect Spacebrew and Bluetooth for the Spacebrew Collab at Parsons, Spring 2014.

See the node bluetooth-serial-port module on Github [here](https://github.com/eelcocramer/node-bluetooth-serial-port) and on npm [here](https://www.npmjs.org/package/bluetooth-serial-port).

==========

Uses websocket connection on server, currently connects to localhost port 5000.

ws node module available on Github [here](https://github.com/einaros/ws) and on npm [here](https://www.npmjs.org/package/ws).

===


####Basic setup
server.js runs the node server. In the command line, start the server by navigating to that folder and typing "node server.js". Then open public/index.html, and it should then connect to the local server and should send a message to the terminal console.

Note that the node module socket.io is included in the node_modules folder; however, no file is currently accessing it.