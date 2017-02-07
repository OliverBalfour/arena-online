
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
		dom.show('game');
		socket.emit('play');
	},
	startGame: function(playerData){
		//Set up canvas and render loop
		Engine.client.playing = true;
		Engine.client.setupCanvas();
		Engine.render.loop();

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
			}
		}

		//Load spritesheets
		Engine.resource.loadImages(state.players.map(function(p){return 'textures/' + p.texture + '.png'}), function(spritesheets){
			for(var i = 0; i < spritesheets.length; i++){
				state.players[i].spritesheet = spritesheets[i];
				
				Engine.entity.entities.filter(function(p){
					return p.pid === state.players[i].id
				})[0].spritesheet = spritesheets[i];
			}
		});
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

var dom = {
	id: function(s){ return document.getElementById(s); },
	hide: function(s){ this.id(s).classList.add('hidden'); },
	show: function(s){ this.id(s).classList.remove('hidden'); }
}
