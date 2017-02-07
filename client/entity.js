
Engine.entity = {
	entities: [],
	textures: {}
};

//empty entity object constructor
Engine.entity.Empty = function(){
	this.pos = {x: 0, y: 0, r: 0};
	this.vel = {x: 0, y: 0, r: 0};
	this.acc = {x: 0, y: 0, r: 0};
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
Engine.entity.Empty.prototype.checkTileCollision = function(side){
	var tiles1 = Engine.render.getMapLayer(Engine.render.map, 'Foreground').tiles,
		tiles2 = Engine.render.getMapLayer(Engine.render.map, 'Foreground 2').tiles,
		//add half of the width/length in the direction the side faces to allow for basic bounding box/tile collision
		x = Math.floor((this.pos.x + (side === 3 ? -this.size.w / 2 : (side === 1 ? this.size.w / 2 : 0))) / Engine.render.map.data.twidth),
		y = Math.floor((this.pos.y + (side === 0 ? -this.size.l : (side === 2 ? this.size.l / 4 : 0))) / Engine.render.map.data.theight);
	//entity is colliding with a tile in the foreground
	return tiles1[y * Engine.render.map.data.width + x] !== 0 || tiles2[y * Engine.render.map.data.width + x] !== 0;
}

Engine.entity.Empty.prototype.handleTileCollision = function(){
	if(this.checkTileCollision(0))
		this.pos.y += 2;
	if(this.checkTileCollision(1))
		this.pos.x -= 2;
	if(this.checkTileCollision(2))
		this.pos.y -= 2;
	if(this.checkTileCollision(3))
		this.pos.x += 2;
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
	Engine.render.game.fillRect(Engine.client.baseX + this.pos.x - this.size.w / 2, Engine.client.baseY + this.pos.y - this.size.h, this.size.w, this.size.h);
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