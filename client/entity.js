
Engine.entity = {
	entities: [],
	textures: {}
};

//empty entity object constructor
Engine.entity.Empty = function(){
	this.pos = {x: 0, y: 0};
	this.lerpPos = {x: 0, y: 0};
	this.vel = {x: 0, y: 0};
	this.acc = {x: 0, y: 0};
	this.size = {w: 32, l: 16, h: 48};
	this.armour = {
		helmet: 0,
		chestplate: 0,
		shield: 0
	};
	this.hand = 0;
	this.inventory = [];
	this.stats = {
		maxHealth: 0,
		health: 0,
		maxMana: 0,
		mana: 0,
		xpLevel: 0,
		xp: 0,
		speed: 0,
		attackSpeed: 0
	};
	this.direction = 0;
	this.action = 'idle';
	this.frame = 0;
	Engine.entity.entities.push(this);
}

//default entity drawing function
Engine.entity.Empty.prototype.draw = Engine.entity.block;

//tile collision detection, where side is between 0 and 4, 0 for up, 3 for left (clockwise)
Engine.entity.Empty.prototype.handleTileSideCollision = function(side, pos){

	pos = pos || this.pos;

	var tiles1 = Engine.render.getMapLayer(Engine.render.map, 'Foreground').tiles,
		tiles2 = Engine.render.getMapLayer(Engine.render.map, 'Foreground 2').tiles,
		//add half of the width/length in the direction the side faces to allow for basic bounding box/tile collision
		x = pos.x + (side === 3 ? -this.size.w / 2 : (side === 1 ? this.size.w / 2 : 0)),
		y = pos.y + (side === 0 ? -this.size.l : (side === 2 ? this.size.l / 4 : 0));

	var arrX = Math.floor(x / Engine.render.map.data.twidth),
		arrY = Math.floor(y / Engine.render.map.data.theight);

	var collision = tiles1[arrY * Engine.render.map.data.width + arrX] !== 0 || tiles2[arrY * Engine.render.map.data.width + arrX] !== 0;

	if(!collision) return;

	if(side === 0)
		pos.y += Engine.render.map.data.theight - (y % Engine.render.map.data.theight);
	else if(side === 1)
		pos.x -= x % Engine.render.map.data.twidth;
	else if(side === 2)
		pos.y -= y % Engine.render.map.data.theight;
	else if(side === 3)
		pos.x += Engine.render.map.data.twidth - (x % Engine.render.map.data.twidth);

}

Engine.entity.Empty.prototype.handleTileCollision = function(){
	for(var i = 0; i < 4; i++){
		this.handleTileSideCollision(i);
		if(this.lerpPos.x !== 0)
			this.handleTileSideCollision(i, this.lerpPos);
	}
}

Engine.entity.Empty.prototype.lerp = function(){
	if(Math.hypot(this.pos.x - this.lerpPos.x, this.pos.y - this.lerpPos.y) < 5){
		this.pos.x = this.lerpPos.x;
		this.pos.y = this.lerpPos.y;
	}else{
		this.pos.x += (this.lerpPos.x - this.pos.x) * 0.5;
		this.pos.y += (this.lerpPos.y - this.pos.y) * 0.5;
	}
}

//set health and max heath to a number
Engine.entity.Empty.prototype.setHealth = function(health){
	this.stats.health = this.stats.maxHealth = health;
}

//player constructor
Engine.entity.Player = function(){
	Engine.entity.Empty.call(this);
	this.draw = Engine.entity.playerDraw;
	this.dead = false;
	this.setHealth(120);
	this.spritesheet = null;
}
Engine.entity.Player.prototype = Object.create(Engine.entity.Empty.prototype);

//texture entity drawing function
Engine.entity.textureDraw = function(){
	game.useImage(this.texture, function(){
		render.game.drawImage(
			this.texture,
			Engine.client.baseX + Math.floor(this.pos.x) - this.size.w,
			Engine.client.baseY + Math.floor(this.pos.y) - this.size.h,
			this.size.w * 2, this.size.h
		);
		render.game.fillStyle = 'tomato';
		render.game.fillRect(
			Engine.client.baseX + this.pos.x - this.size.w / 2, Engine.client.baseY + this.pos.y - this.size.h - 12,
			this.stats.health / this.stats.maxHealth * this.size.w,
			4
		);
	}.bind(this));
}

//basic black block drawing function
Engine.entity.block = function(){
	Engine.render.game.fillStyle = 'black';
	Engine.render.game.fillRect(
		Engine.client.baseX + this.pos.x - this.size.w / 2,
		Engine.client.baseY + this.pos.y - this.size.h,
		this.size.w, this.size.h
	);
}

//player drawing function
Engine.entity.playerDraw = function(){
	var frame;
	if(this.spritesheet){
		frame = Engine.resource.LPC.getFrame(this.action, this.direction, Math.floor(this.frame));

		Engine.render.game.drawImage(
			this.spritesheet,
			frame.x, frame.y,
			64, 64,
			Engine.client.baseX + this.pos.x - 32, Engine.client.baseY + this.pos.y - 56,
			64, 64
		);

		this.frame += 0.2;
	}
}