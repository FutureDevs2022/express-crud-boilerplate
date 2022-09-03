const http = require('http');
const app = require('./app');
const socketio = require("socket.io");
const { WebSockets } = require("./api/services/sockets/WebSockets");

// set port
const port = process.env.PORT || 3001;
// create server
const server = http.createServer(app);
/** Create socket connection */
const webSockets = new WebSockets();
global.io = socketio.listen(server);
global.io.on('connection', webSockets.connection)
// start server
server.listen(port)
console.log(`App started, listening on port:${port}`)