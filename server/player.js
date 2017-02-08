
const textures = [
	'gold-archer', 'skele-guard', 'nudist', 'universal-male',
	'spearman', 'knight', 'edgy-archer', 'cool-archer',
	'dress-person', 'edgelord', 'goldenspear'
];

const rtexture = () => textures[Math.floor(Math.random() * textures.length)];

const map = require('./tmx');

module.exports = class Player {
	
	constructor (id, x, y) {
		this.x = x;
		this.y = y;
		this.texture = rtexture();
		this.id = id;
		this.input = [];
		this.size = {w: 32, l: 16, h: 48};
	}

	safeInput (input) {
		if(!input.type)
			return;
		if(input.type === 'm' && typeof input.dir === 'number' && input.dir >= 0 && input.dir < 4)
			return {type: input.type, dir: input.dir};
	}

	//tile collision detection, where side is between 0 and 4, 0 for up, 3 for left (clockwise)
	handleTileSideCollision (side) {

		let tiles1 = map.layers.filter(l => l.name === 'Foreground')[0].tiles,
			tiles2 = map.layers.filter(l => l.name === 'Foreground 2')[0].tiles,
			//add half of the width/length in the direction the side faces to allow for basic bounding box/tile collision
			x = this.x + (side === 3 ? -this.size.w / 2 : (side === 1 ? this.size.w / 2 : 0)),
			y = this.y + (side === 0 ? -this.size.l : (side === 2 ? this.size.l / 4 : 0));

		let arrX = Math.floor(x / map.data.twidth),
			arrY = Math.floor(y / map.data.theight);

		let collision = tiles1[arrY * map.data.width + arrX] !== 0 || tiles2[arrY * map.data.width + arrX] !== 0;

		if(!collision) return;

		if(side === 0)
			this.y += map.data.theight - (y % map.data.theight);
		else if(side === 1)
			this.x -= x % map.data.twidth;
		else if(side === 2)
			this.y -= x % map.data.theight;
		else if(side === 3)
			this.x += map.data.twidth - (x % map.data.twidth);

	}

	handleTileCollision () {
		for(let i of [0,1,2,3])
			this.handleTileSideCollision(i);
	}

}
