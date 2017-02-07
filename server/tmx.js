
//Reeeeally hacky TMX parser, simple port of the client one
//Doesn't have tilesets


const parser = new (require('dom-parser'))();
const fs = require('fs');
const Zlib = require('zlibjs');

const tmxData = fs.readFileSync('./client/arena.tmx', 'utf8');

global.btoa = str => new Buffer(str).toString('base64');
global.atob = str => new Buffer(str, 'base64').toString();

module.exports = interpretCompressedMap(tmxData);

function interpretCompressedMap(tmx){
	//get map metadata
	var mapParent = parser.parseFromString(tmx, 'text/xml'),
		map = mapParent.getElementsByTagName('map')[0],
		mapWidth = parseInt(map.getAttribute('width')),
		mapHeight = parseInt(map.getAttribute('height')),
		mapTileWidth = parseInt(map.getAttribute('tilewidth')),
		mapTileHeight = parseInt(map.getAttribute('tilewidth'));
	
	//loop through the map's layers and populate the array layersArr with their data
	var layersArr = [],
		layerElements = map.getElementsByTagName('layer');
	
	for(var i = 0, layerEl, tileDataEl, j, tiles, parsedTiles; i < layerElements.length; i++){
		layerEl = layerElements[i];
		tileDataEl = layerEl.getElementsByTagName('data')[0];
		
		tiles = [];
		parsedTiles = [];
		
		//decompress the tile base64 zlib compressed gibberish and put into an array, parsedTiles
		tiles = new Zlib.Inflate(atob(tileDataEl.innerHTML).split('').map(function(e){return e.charCodeAt(0)})).decompress();
		tiles.slice.call(tiles);
		for(j = 0; j <= tiles.length; j += 4){
			parsedTiles.push(tiles[j] | tiles[j + 1] << 8 | tiles[j + 2] << 16 | tiles[j + 3] << 24);
		}
		
		//add the metadata to the layersArr array
		layersArr.push({
			name: layerEl.getAttribute('name'),
			width: parseInt(layerEl.getAttribute('width')),
			height: parseInt(layerEl.getAttribute('height')),
			tiles: parsedTiles
		});
	}
	
	//get all objects from all object layers
	var objects = {},
		objectGroups = map.getElementsByTagName('objectgroup');
	
	for(var i = 0, group, j, groupObjects, object, k, property, custom; i < objectGroups.length; i++){
		objects[objectGroups[i].getAttribute('name')] = [];
		group = objects[objectGroups[i].getAttribute('name')];
		groupObjects = objectGroups[i].getElementsByTagName('object');
		for(j = 0; j < groupObjects.length; j++){
			object = groupObjects[j];
			custom = {};
			if(object.getElementsByTagName('properties').length !== 0){
				for(k = 0; k < object.getElementsByTagName('properties')[0].getElementsByTagName('property').length; k++){
					property = object.getElementsByTagName('properties')[0].getElementsByTagName('property')[k];
					custom[property.getAttribute('name')] = property.getAttribute('value');
				}
			}
			group.push({
				id: parseInt(object.getAttribute('id')),
				x: parseInt(object.getAttribute('x')),
				y: parseInt(object.getAttribute('y')),
				custom: custom
			})
		}
	}
	
	//return the fully interpreted Tile Map XML (TMX) data as an object
	return {
		layersArr: layersArr,
		objects: objects,
		data: {
			width: mapWidth,
			height: mapHeight,
			twidth: mapTileWidth,
			theight: mapTileHeight
		}
	};
}
