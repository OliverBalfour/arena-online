
const textures = ['gold-archer', 'skele-guard', 'nudist'];

const rtexture = () => textures[Math.floor(Math.random() * textures.length)];

//const map = require('./tmx');

module.exports = class Player {
	
	constructor (id, x, y) {
		this.x = x;
		this.y = y;
		this.texture = rtexture();
		this.id = id;
		this.input = [];
	}

	safeInput (input) {
		if(!input.type)
			return;
		if(input.type === 'm' && typeof input.dir === 'number' && input.dir >= 0 && input.dir < 4)
			return {type: input.type, dir: input.dir};
	}
/*
	//tile collision detection, where side is between 0 and 4, 0 for up, 3 for left (clockwise)
	checkTileCollision (side) {
		var tiles1 = map.layersArr.filter(l => l.name === 'Foreground')[0].tiles,
			tiles2 = map.layersArr.filter(l => l.name === 'Foreground 2')[0].tiles,
			//add half of the width/length in the direction the side faces to allow for basic bounding box/tile collision
			x = Math.floor((this.x + (side === 3 ? -32 / 2 : (side === 1 ? 32 / 2 : 0))) / map.data.twidth),
			y = Math.floor((this.y + (side === 0 ? -16 : (side === 2 ? 16 / 4 : 0))) / map.data.theight);
		//entity is colliding with a tile in the foreground
		return tiles1[y * map.data.width + x] !== 0 || tiles2[y * map.data.width + x] !== 0;
	}

	handleTileCollision () {
		if(this.checkTileCollision(0))
			this.y += 2;
		if(this.checkTileCollision(1))
			this.x -= 2;
		if(this.checkTileCollision(2))
			this.y -= 2;
		if(this.checkTileCollision(3))
			this.x += 2;
	}
*/
}
