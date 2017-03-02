
Engine.resource.XHR('arena.tmx', function(txt){
	var mapData = Engine.render.interpretCompressedMap(txt, '');
	Engine.render.loadMap(mapData);
});

window.onresize = Engine.client.setupCanvas;


var socket = io();

var handler = {
	connect: function(id){
		state.id = id;
		console.log('Logged in with ID: ' + id);
	},
	joinGame: function(){
		dom.hide('main-menu');
		dom.show('waiting-room');
		socket.emit('play');
	},
	startGame: function(playerData){
		//Set up canvas and render loop
		Engine.client.playing = true;
		Engine.client.setupCanvas();
		Engine.render.loop();
		dom.hide('waiting-room');
		dom.show('game');

		//Initial player data
		state.players = playerData;
		Engine.client.player.pos.x = state.getPlayer().x;
		Engine.client.player.pos.y = state.getPlayer().y;

		//Get Engine.entity.Player s
		for(var i = 0, p; i < state.players.length; i++){
			if(state.id === state.players[i].id){
				Engine.client.player.pid = state.id;
			}else{
				p = new Engine.entity.Player();
				p.pid = state.players[i].id;
				p.pos.x = state.players[i].x;
				p.pos.y = state.players[i].y;
			}
		}

		//Load spritesheets
		Engine.resource.loadImages(state.players.map(function(p){return 'sprites/' + p.texture + '.png'}), function(spritesheets){
			for(var i = 0; i < spritesheets.length; i++){
				state.players[i].spritesheet = spritesheets[i];
				
				Engine.entity.entities.filter(function(p){
					return p.pid === state.players[i].id
				})[0].spritesheet = spritesheets[i];
			}
		});
	},
	update: function(playerData){
		//Update player data
		state.players = playerData;

		//Update positions
		for(var i = 0, p; i < state.players.length; i++){
			p = Engine.entity.entities.filter(function(pl){return pl.pid === state.players[i].id})[0];
			p.lerpPos.x = state.players[i].x;
			p.lerpPos.y = state.players[i].y;
			if(p !== Engine.client.player){
				p.action = state.players[i].action;

				//Have they actually moved?
				if(p.action === 'walk' && Math.hypot(p.lerpPos.x - p.pos.x, p.lerpPos.y - p.pos.y) < 5){
					p.action = 'idle';
					p.frame = 0;
				}

				p.direction = state.players[i].direction;
				if(p.direction === 0) p.direction = 2;
				else if(p.direction === 2) p.direction = 0;
			}
			p.lerp();
		}
	},
	dead: function(id){
		console.log(id + ' died lol xD');
	}
}

var state = {
	players: [],
	getPlayer: function(){
		return state.players.filter(function(player){return player.id === state.id})[0];
	}
};

socket.on('game-start', handler.startGame.bind(handler));
socket.on('connected', handler.connect.bind(handler));
socket.on('game-update', handler.update.bind(handler));
socket.on('dead', handler.dead.bind(handler));

var dom = {
	id: function(s){ return document.getElementById(s); },
	hide: function(s){ this.id(s).classList.add('hidden'); },
	show: function(s){ this.id(s).classList.remove('hidden'); }
}
