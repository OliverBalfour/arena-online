Engine.client = {
	mouse: {x: 0, y: 0, down: false},
	keys: [],
	playing: false,
	scale: 2,
	w: window.innerWidth / 2,
	h: window.innerHeight / 2
}

Engine.client.player = new Engine.entity.Player();

/* Client events */

document.addEventListener('keydown', function(e){
	Engine.client.keys[e.which || e.keyCode] = true;
});

document.addEventListener('keyup', function(e){
	Engine.client.keys[e.which || e.keyCode] = false;
});

document.addEventListener('mousedown', function(e){
	Engine.client.mouse.down = true;
});

document.addEventListener('mousedown', function(e){
	Engine.client.mouse.down = true;
});

document.addEventListener('mouseup', function(e){
	Engine.client.mouse.down = false;
});

document.addEventListener('mousemove', function(e){
	Engine.client.mouse.x = e.clientX;
	Engine.client.mouse.y = e.clientY;
});


Engine.client.setupCanvas = function(){
	Engine.render.gameCanvas.width = window.innerWidth;
	Engine.client.w = window.innerWidth / Engine.client.scale;
	Engine.render.gameCanvas.height = window.innerHeight;
	Engine.client.h = window.innerHeight / Engine.client.scale;
	Engine.render.game.webkitImageSmoothingEnabled = false;
	Engine.render.game.mozImageSmoothingEnabled = false;
	Engine.render.game.imageSmoothingEnabled = false;
	Engine.render.game.restore();
	Engine.render.game.save();
	Engine.render.game.scale(Engine.client.scale, Engine.client.scale);
}

Engine.client.movePlayer = function(){

	//W
	if(Engine.client.keys[87]){
		Engine.client.player.pos.y -= 30 * Engine.render.delta;
		Engine.client.player.direction = 2;
		Engine.client.player.action = 'walk';
		if(Engine.render.frames % 4 === 0)
			socket.emit('input', {type: 'm', dir: 0, f: Math.floor(Engine.client.player.frame)});
	}
	//S
	if(Engine.client.keys[83]){
		Engine.client.player.pos.y += 30 * Engine.render.delta;
		Engine.client.player.direction = 0;
		Engine.client.player.action = 'walk';
		if(Engine.render.frames % 4 === 0)
			socket.emit('input', {type: 'm', dir: 2, f: Math.floor(Engine.client.player.frame)});
	}

	//A
	if(Engine.client.keys[65]){
		Engine.client.player.pos.x -= 30 * Engine.render.delta;
		Engine.client.player.direction = 3;
		Engine.client.player.action = 'walk';
		if(Engine.render.frames % 4 === 0)
			socket.emit('input', {type: 'm', dir: 3, f: Math.floor(Engine.client.player.frame)});
	}
	//D
	if(Engine.client.keys[68]){
		Engine.client.player.pos.x += 30 * Engine.render.delta;
		Engine.client.player.direction = 1;
		Engine.client.player.action = 'walk';
		if(Engine.render.frames % 4 === 0)
			socket.emit('input', {type: 'm', dir: 1, f: Math.floor(Engine.client.player.frame)});
	}

	if(Engine.client.keys[87] && Engine.client.keys[83])
		Engine.client.player.action = 'idle';

	if(Engine.client.keys[65] && Engine.client.keys[68]){
		Engine.client.player.action = 'idle';
		Engine.client.player.direction = 0;
	}

	if(Engine.client.player.action === 'walk' && !(
		Engine.client.keys[87] || Engine.client.keys[83]
		|| Engine.client.keys[65] || Engine.client.keys[68]
	)){
		Engine.client.player.action = 'idle';
	}

	Engine.client.player.handleTileCollision();
	
	if(Engine.client.player.pos.x < 0) Engine.client.player.pos.x = 0;
	if(Engine.client.player.pos.x > Engine.render.map.data.width * Engine.render.map.data.twidth - 1) Engine.client.player.pos.x = Engine.render.map.data.width * Engine.render.map.data.twidth - 1;
	if(Engine.client.player.pos.y < 0) Engine.client.player.pos.y = 0;
	if(Engine.client.player.pos.y > Engine.render.map.data.height * Engine.render.map.data.theight) Engine.client.player.pos.x = Engine.render.map.data.height * Engine.render.map.data.theight;
	
}

//are they attacking?
Engine.client.updateAttack = function(){
	//sword
	if(Engine.client.keys[32]){
		Engine.client.player.action = 'slash';
		socket.emit('input', {type: 'at'});
	}else if(Engine.client.player.action === 'slash'){
		Engine.client.player.action = 'idle';
		socket.emit('input', {type: 'sat'});
	}
}

//calculate x and y to start map Engine.render ing from
Engine.client.calculateBasePos = function(){
	var x = -Engine.client.player.pos.x + Engine.client.w / 2,
		y = -Engine.client.player.pos.y + Engine.client.h / 2;
	
	Engine.client.baseX = x > 0 ? 0 : (x < -Engine.render.map.data.width  * Engine.render.map.data.twidth  + Engine.client.w ? -Engine.render.map.data.width  * Engine.render.map.data.twidth  + Engine.client.w : x);
	Engine.client.baseY = y > 0 ? 0 : (y < -Engine.render.map.data.height * Engine.render.map.data.theight + Engine.client.h ? -Engine.render.map.data.height * Engine.render.map.data.theight + Engine.client.h : y);
}