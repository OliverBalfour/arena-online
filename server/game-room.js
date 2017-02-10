
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

		this.entities = [];

		for(let socket of this.players){
			socket.join(this.id);
			let spwn = rspawn();
			socket.player = new Player(socket.id, spwn.x, spwn.y);
		}

		this.io.to(this.id).emit('game-start', this.safePlayers());
		console.log('New game started: ' + this.id);

		this.physicsLoopInterval = setInterval(this.physicsLoop.bind(this), 15);
		this.updateLoopInterval = setInterval(this.updateLoop.bind(this), 50);

		this.delta = 0;
		this.loopTime = Date.now();
		this.prevLoopTime = Date.now() - 1;
	}

	remove (player) {
		if(this.players.indexOf(player))
			this.players.splice(this.players.indexOf(player), 1);
	}

	//Safely transmissable
	safePlayers (exception) {
		return this.players.filter(p => p !== exception).map(socket => socket.player);
	}

	physicsLoop () {

		this.prevLoopTime = this.loopTime;
		this.loopTime = Date.now();
		this.delta = 1 / (this.loopTime - this.prevLoopTime);

		for(let ent of this.entities){
			ent.x += ent.vx;
			ent.y += ent.vy;
			ent.checkCollision();
		}

		for(let socket of this.players){
			let player = socket.player;
			if(!player) continue;

			for(let input of player.input){
				let update = player.safeInput(input);
				if(!update) continue;
				if(update.type === 'm'){
					switch(update.dir){
						case 0:
							player.y -= 120 * this.delta;
							break;
						case 1:
							player.x += 120 * this.delta;
							break;
						case 2:
							player.y += 120 * this.delta;
							break;
						case 3:
							player.x -= 120 * this.delta;
							break;
					}
					player.action = 'walk';
					player.direction = update.dir;
				}
			}

			player.input = [];
			player.handleTileCollision();
		}
	}

	updateLoop () {
		this.io.to(this.id).emit('game-update', this.safePlayers());
	}

}
