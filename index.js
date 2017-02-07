
/* Dependencies */

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const chalk = require('chalk');
const path = require('path');

const WebSocketHandler = require('./server/ws');
const WaitingRoom = require('./server/waiting-room');


/* Routing */

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.get('/*', function(req, res){
	res.sendFile(path.join(__dirname, 'client', req.params[0]));
});


/* State tree */

const tree = {};

tree.waitingRoom = new WaitingRoom(tree, io, {maxPlayers: 2});
tree.gameRooms = [];
tree.getGame = id => tree.gameRooms.filter(rm => rm.id === id)[0];


/* WebSockets (socket.io) */

io.engine.ws = new (require('uws').Server)({
	noServer: true,
	perMessageDeflate: false
});

const handler = new WebSocketHandler(tree, io);

io.on('connection', handler.connect.bind(handler));


/* Initialisation */

//If a (valid) port was supplied as a command line parameter (`node index.js PORT_NO`) then use it
//Otherwise, fall back to port 3000
const port = process.argv[2] ?
		process.argv[2].match(/[^0-9]+/g) ?
			3000 : parseInt(process.argv[2])
		: 3000;

http.listen(port, function(){
	console.log(chalk.cyan('Loaded to ') + chalk.blue('http://localhost:') + chalk.green.underline(port));
});
