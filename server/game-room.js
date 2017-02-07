
const UUID = require('uuid');
const Player = require('./player');

const map = {
	height: 40,
	width: 40	
}

const spawns = [
	//Castle path
	{
		x: 336,
		y: 544
	},
	//Middle of the battleground
	{
		x: 288,
		y: 1008
	},
	//In front of the stone guardians in front of the stone thingo
	{
		x: 1120,
		y: 1168
	},
	//The small bridge at the bottom
	{
		x: 832,
		y: 1104
	},
	//The corner between the two bridges at the top
	{
		x: 1168,
		y: 336
	},
	//In the middle of the grass in the middle of nowhere
	{
		x: 704,
		y: 608
	}
];

const rspawn = () => spawns[Math.floor(Math.random() * spawns.length)];

module.exports = class GameRoom {
	
	constructor (tree, io, players) {
		this.id = UUID();
		this.tree = tree;
		this.io = io;
		this.players = players || [];

		for(let socket of this.players){
			socket.join(this.id);
			let spwn = rspawn();
			socket.player = new Player(socket.id, spwn.x, spwn.y);
		}

		this.io.to(this.id).emit('game-start', this.safePlayers());
		console.log('New game started: ' + this.id);
	}

	remove (player) {
		if(this.players.indexOf(player))
			this.players.splice(this.players.indexOf(player), 1);
	}

	//Safely transmissable
	safePlayers (exception) {
		return this.players.filter(p => p !== exception).map(socket => socket.player);
	}

}
