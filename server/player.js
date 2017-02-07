
const textures = ['gold-archer', 'skele-guard', 'nudist'];

const rtexture = () => textures[Math.floor(Math.random() * textures.length)];

module.exports = class Player {
	
	constructor (id, x, y) {
		this.x = x;
		this.y = y;
		this.texture = rtexture();
		this.id = id;
	}

}
