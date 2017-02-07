
const UUID = require('uuid');
const GameRoom = require('./game-room');

module.exports = class WaitingRoom {
	
	constructor (tree, io, opts) {
		this.id = UUID();
		this.tree = tree;
		this.io = io;
		this.players = [];
		this.options = opts || {};
	}

	add (player) {
		player.emit('waiting-room');
		console.log('Added player ' + player.id + ' to waiting room.');
		this.players.push(player);
		if(this.players.length === this.options.maxPlayers)
			this.createGame();
	}

	remove (player) {
		if(this.players.indexOf(player))
			this.players.splice(this.players.indexOf(player), 1);
	}

	createGame () {
		for(let socket of this.players){
			socket.leave(this.id);
		}

		this.tree.gameRooms.push(new GameRoom(this.tree, this.io, this.players.slice(0)));
		this.players = [];
	}

}
