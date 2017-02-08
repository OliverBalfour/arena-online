
//Reeeeally hacky TMX parser
//Doesn't have tilesets

const fs = require('fs');
const zlib = require('zlib');


const tmxData = fs.readFileSync('./client/arena.json', 'utf8');

function tileData(d, callback){
	const buffer = Buffer.from(d, 'base64');
	zlib.unzip(buffer, (err, buffer) => {
		if(!err){
			let tiles = buffer.toString();
			let parsedTiles = [];
			tiles.slice.call(tiles);
			for(j = 0; j <= tiles.length; j += 4){
				parsedTiles.push(tiles[j] | tiles[j + 1] << 8 | tiles[j + 2] << 16 | tiles[j + 3] << 24);
			}
			callback(parsedTiles);
		}else{
			console.log(err);
		}
	});
}

module.exports = interpretJSONCompressedMap(tmxData);

function interpretJSONCompressedMap(tmx){
	const map = JSON.parse(tmx);
	
	const layers = [];
	
	for(let layer of map.layers){
		tileData(layer.data, (tiled) => {
			layers.push({
				name: layer.name,
				width: layer.width,
				height: layer.height,
				tiles: tiled
			});
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
