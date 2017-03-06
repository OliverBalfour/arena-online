
const textures = [
	'gold-archer', 'skele-guard', 'universal-male',
	'spearman', 'knight', 'edgy-archer', 'cool-archer',
	'dress-person', 'edgelord', 'goldenspear',
	'archer-dark-skin', 'archer-bucket-hat', 'fullgolden-archermist',
	'golden-swordsman', 'pink-hair', 'light-armour-knight',
	'dark-light-armour', 'orc-sword',
	'dark-spearman', 'caped-spearwoman', 'jimmy'
];

const rarities = ['nudist', 'enraged-nudist'];

const rtexture = () => Math.floor(Math.random() * 200) < rarities.length ?
	rarities[Math.floor(Math.random() * rarities.length)]
	: textures[Math.floor(Math.random() * textures.length)];

const map = require('./tmx');

module.exports = class Player {
	
	constructor (id, x, y) {
		this.x = x;
		this.y = y;
		this.texture = rtexture();
		this.id = id;
		this.input = [];
		this.size = {w: 32, l: 16, h: 48};
		//Animation cycle
		this.action = 'walk';
		//Frame in whatever animation cycle the player is doing
		this.frame = 0;
		this.direction = 0;
		this.health = 50;
		this.dead = false;
	}

	safeInput (input) {
		if(!input.type)
			return;
		if(
			input.type === 'm'
			&& typeof input.dir === 'number'
			&& Math.floor(input.dir) >= 0 && Math.floor(input.dir) < 4
		){
			//8 is the number of frames in the walk cycle
			return {type: input.type, dir: Math.floor(input.dir)};
		}else if(input.type === 'at' || input.type === 'sat'){
			return {type: input.type};
		}
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
			this.y -= y % map.data.theight;
		else if(side === 3)
			this.x += map.data.twidth - (x % map.data.twidth);

	}

	handleTileCollision () {
		for(let i of [0,1,2,3])
			this.handleTileSideCollision(i);
	}

	//blarg im ded: https://c1.staticflickr.com/4/3627/3457088327_4544ea0fae.jpg
	die () {
		//Reset health to quash any graphics bugs or whateves
		this.health = 0;
		//In the next update loop this gets handled by the game room
		this.dead = true;
	}

}
