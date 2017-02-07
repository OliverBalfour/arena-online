
const chalk = require('chalk');

module.exports = class WebSocketHandler {

	constructor (tree, io) {
		this.tree = tree;
		this.io = io;
	}

	connect (socket) {
		console.log(chalk.green('A user connected: ' + socket.id));
		socket.emit('connected', socket.id);

		socket.on('play', this.play.bind(this, socket));
		socket.on('disconnect', this.disconnect.bind(this, socket));
		socket.on('input', this.input.bind(this, socket));
	}

	play (socket) {
		this.tree.waitingRoom.add(socket);
	}

	input (socket, input) {
		if(!socket.player) return;
		socket.player.input.push(input);
	}

	disconnect (socket) {
		this.tree.waitingRoom.remove(socket);

		for(let room of this.tree.gameRooms)
			room.remove(socket);

		console.log(socket.id + ' disconnected');
	}
	
}
