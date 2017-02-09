
//Reeeeally hacky TMX parser
//Doesn't have tilesets

const fs = require('fs');
const zlib = require('zlib');


const tmxData = fs.readFileSync('./client/arena.json', 'utf8');


module.exports = interpretJSONCompressedMap(tmxData);

function interpretJSONCompressedMap(tmx){
	const map = JSON.parse(tmx);

	const layers = [];

	for(let layer of map.layers){
		layers.push({
			name: layer.name,
			width: layer.width,
			height: layer.height,
			tiles: layer.data
		});
	}

	return {
		layers: layers,
		data: {
			width: map.width,
			height: map.height,
			twidth: map.tilewidth,
			theight: map.tileheight
		}
	};
}
