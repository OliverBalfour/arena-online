Engine.render = {
	parser: new DOMParser(), //XML DOM parser
	map: null,
	frames: 0
};

//game canvases
Engine.render.gameCanvas = document.getElementById('game');
Engine.render.game = Engine.render.gameCanvas.getContext('2d');

//layer holding canvases, populated by the drawLayer method of render
Engine.render.backgroundCanvas = document.createElement('canvas');
Engine.render.background = Engine.render.backgroundCanvas.getContext('2d');
Engine.render.foregroundCanvas = document.createElement('canvas');
Engine.render.foreground = Engine.render.foregroundCanvas.getContext('2d');
Engine.render.topCanvas = document.createElement('canvas');
Engine.render.top = Engine.render.topCanvas.getContext('2d');

//interprets raw TMX base64 zlib compressed map and returns an object with the data
Engine.render.interpretCompressedMap = function(tmx, tspath){
	//get map metadata
	var mapParent = Engine.render.parser.parseFromString(tmx, 'text/xml'),
		map = mapParent.getElementsByTagName('map')[0],
		mapWidth = parseInt(map.getAttribute('width')),
		mapHeight = parseInt(map.getAttribute('height')),
		mapTileWidth = parseInt(map.getAttribute('tilewidth')),
		mapTileHeight = parseInt(map.getAttribute('tilewidth')),
		tilesets = [],
		tilesetElements = map.getElementsByTagName('tileset');
	
	//loop through the tilesets in the map and populate the tilesets array with their metadata
	for(var i = 0, tilesetEl, tilesetSourceEl, tileset; i < tilesetElements.length; i++){
		tilesetEl = tilesetElements[i];
		tilesetSourceEl = tilesetEl.getElementsByTagName('image')[0];
		tileset = {
			firstGID: parseInt(tilesetEl.getAttribute('firstgid')),
			name: tilesetEl.getAttribute('name'),
			twidth: parseInt(tilesetEl.getAttribute('tilewidth')),
			theight: parseInt(tilesetEl.getAttribute('tileheight')),
			source: tilesetSourceEl.getAttribute('source'),
			widthpx: parseInt(tilesetSourceEl.getAttribute('width')),
			heightpx: parseInt(tilesetSourceEl.getAttribute('height')),
			tileset: new Image()
		};
		tileset.tileset.src = tspath + tileset.source;
		tileset.width = Math.floor(tileset.widthpx / tileset.twidth);
		tileset.height = Math.floor(tileset.heightpx / tileset.theight);
		tilesets.push(tileset);
	}
	
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
		tilesets: tilesets,
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

//load all of the tilesets in a given map and execute a callback function once the process is complete
Engine.render.loadTilesets = function(map, callback){	
	//wait until all tilesets have loaded
	var loadedTilesets = 0;
	for(var i = 0; i < map.tilesets.length; i++){
		//set onload event
		map.tilesets[i].tileset.onload = function(){
			loadedTilesets ++;
			
			//if all of the tilesets specified by the map data have loaded in, call the callback
			if(loadedTilesets === map.tilesets.length){
				callback();
			}
		}
	}
}

//get a map layer given a map and the layer name
Engine.render.getMapLayer = function(map, layerName){
	var layerObj = false;
	for(var i = 0; i < map.layersArr.length; i++){
		if(map.layersArr[i].name === layerName){
			layerObj = map.layersArr[i];
		}
	}
	return layerObj;
}

//draws a layer from a map to the correct canvas given map data with preloaded tilesets (loaded from the drawLayername functions)
Engine.render.prepareLayer = function(layerName, map, ctx){
	//if layer doesn't exist, exit function
	if(!Engine.render.getMapLayer(map, layerName)){
		console.error('Couldn\'t find layer ' + layerName);
		return false;
	}
	
	//defining basic variables for use throughout function
	var tiles = Engine.render.getMapLayer(map, layerName).tiles,
		sx, sy, sw, sh,
		dx, dy, dw, dh,
		tileset,
		tilesets = map.tilesets,
		data = map.data;
	
	//loop through the layer's tiles
	for(var i = 0, tile, j; i < tiles.length; i++){
		tile = tiles[i];
		
		//only render tile if not empty
		if(tile !== 0){
			//loop through tilesets to find the one which the tile is in
			for(j = 0; j < tilesets.length; j++){
				tileset = tilesets[j];
				if(tile < tileset.firstGID){
					tileset = tilesets[j - 1];
					break;
				}
			}
			
			//get positions and sizes for tiles
			
			//i is the tile number
			//tile is the tile GID
			
			sx = tileset.twidth  * ((tile - tileset.firstGID) % tileset.width);
			sy = tileset.theight * Math.floor((tile - tileset.firstGID) / tileset.width);
			
			dx = tileset.twidth  * (i % data.width);
			dy = tileset.theight * Math.floor(i / data.width);
			
			sw = dw = tileset.twidth;
			sh = dh = tileset.theight;
			
			//draw the tile to the layer canvas context
			ctx.drawImage(
				tileset.tileset,
				sx, sy, sw, sh,
				dx, dy, dw, dh
			);
		}
	}
}

//combines functionality of other methods to create an overarching map loading function; which, given map data, will load the map layers to the appropriate canvases and save the map data as the current map
Engine.render.loadMap = function(mapData){
	Engine.render.map = mapData;
	Engine.render.loadTilesets(mapData, function(){
		//change canvas sizes to fit the map
		Engine.render.backgroundCanvas.width  = Engine.render.foregroundCanvas.width  = Engine.render.topCanvas.width  = mapData.data.width  * mapData.data.twidth;
		Engine.render.backgroundCanvas.height = Engine.render.foregroundCanvas.height = Engine.render.topCanvas.height = mapData.data.height * mapData.data.theight;
		
		//draw layers to layer canvases
		Engine.render.prepareLayer('Background',   mapData, Engine.render.background);
		Engine.render.prepareLayer('Background 2', mapData, Engine.render.background);
		Engine.render.prepareLayer('Foreground',   mapData, Engine.render.foreground);
		Engine.render.prepareLayer('Foreground 2', mapData, Engine.render.foreground);
		Engine.render.prepareLayer('Top',          mapData, Engine.render.top);
	});
}

//show the map's background, which is drawn first
Engine.render.drawMapBackground = function(){
	Engine.render.game.drawImage(
		Engine.render.backgroundCanvas,
		Engine.client.baseX, Engine.client.baseY
	);
	Engine.render.game.drawImage(
		Engine.render.foregroundCanvas,
		Engine.client.baseX, Engine.client.baseY
	);
}

//show the map's foreground, containing trees etc, drawn last
Engine.render.drawMapForeground = function(){
	Engine.render.game.drawImage(
		Engine.render.topCanvas,
		Engine.client.baseX, Engine.client.baseY
	);
}

//draw the entities to the screen, on top of the map background
Engine.render.drawEntities = function(){
	var sortedEntities = Engine.entity.entities.sort(function(a, b){
		return a.pos.y - b.pos.y;
	});
	for(var i = 0; i < sortedEntities.length; i++){
		sortedEntities[i].draw();
	}
}

//RENDER LOOP

Engine.render.loop = function(){
	//request animation frame
	requestAnimFrame(this.loop.bind(this));
	
	//game loop code
	if(Engine.client.playing){
		//clear the previous frame
		Engine.render.game.clearRect(0, 0, Engine.client.w, Engine.client.h);
		
		//move player
		Engine.client.movePlayer();
		
		//calculate where everything should be drawn
		Engine.client.calculateBasePos();
		
		//update game canvas
		Engine.render.drawMapBackground();
		Engine.render.drawEntities();
		Engine.render.drawMapForeground();
		
		//increment frame counter
		Engine.render.frames ++;
		
		//if space is down, attack
		if(Engine.client.keys[32]){
			//Engine.client.player.attack();
		}
		
	}
	
}