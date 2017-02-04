Engine.client = {
	mouse: {x: 0, y: 0, down: false},
	keys: [],
	playing: false,
	w: window.innerWidth,
	h: window.innerHeight
}

Engine.client.player = new Engine.entity.Player();
Engine.client.player.pos = {x: 336, y: 544};

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
	Engine.render.gameCanvas.width = Engine.client.w = window.innerWidth;
	Engine.render.gameCanvas.height = Engine.client.h = window.innerHeight;
	Engine.render.game.webkitImageSmoothingEnabled = false;
	Engine.render.game.mozImageSmoothingEnabled = false;
	Engine.render.game.imageSmoothingEnabled = false;
}

Engine.client.movePlayer = function(){
	//A
	if(Engine.client.keys[65]){
		Engine.client.player.pos.x -= 2;
	}
	//D
	if(Engine.client.keys[68]){
		Engine.client.player.pos.x += 2;
	}
	//W
	if(Engine.client.keys[87]){
		Engine.client.player.pos.y -= 2;
	}
	//S
	if(Engine.client.keys[83]){
		Engine.client.player.pos.y += 2;
	}

	Engine.client.player.handleTileCollision();
	
	if(Engine.client.player.pos.x < 0) Engine.client.player.pos.x = 0;
	if(Engine.client.player.pos.x > Engine.render.map.data.width * Engine.render.map.data.twidth - 1) Engine.client.player.pos.x = Engine.render.map.data.width * Engine.render.map.data.twidth - 1;
	if(Engine.client.player.pos.y < 0) Engine.client.player.pos.y = 0;
	if(Engine.client.player.pos.y > Engine.render.map.data.height * Engine.render.map.data.theight) Engine.client.player.pos.x = Engine.render.map.data.height * Engine.render.map.data.theight;
	
}

//calculate x and y to start map Engine.rendering from
Engine.client.calculateBasePos = function(){
	var x = -Engine.client.player.pos.x + Engine.client.w / 2,
		y = -Engine.client.player.pos.y + Engine.client.h / 2;
	
	Engine.client.baseX = x > 0 ? 0 : (x < -Engine.render.map.data.width  * Engine.render.map.data.twidth  + Engine.client.w ? -Engine.render.map.data.width  * Engine.render.map.data.twidth  + Engine.client.w : x);
	Engine.client.baseY = y > 0 ? 0 : (y < -Engine.render.map.data.height * Engine.render.map.data.theight + Engine.client.h ? -Engine.render.map.data.height * Engine.render.map.data.theight + Engine.client.h : y);
}