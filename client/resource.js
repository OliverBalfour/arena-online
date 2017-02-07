//Namespace for resource module
Engine.resource = {
	
	//Data namespace
	//Designed only for use by specialised functions
	//Messing with values may cause problems
	data: {
		//For Engine.resource.loadImageObject and its helpers
		totalImages: 0,
		loadedImages: 0,
		loadImageObjectData: {},
		loadImageObjectCallback: null,
		loadImageObjectCallbackPerImage: null
	}
};

//XMLHttpRequest wrapper for XML and JSON data (or anything really)
//Takes a file path and a callback
//Sends the data (responseText) as a parameter to the callback
//Also sends the XMLHttpRequest object for reference
Engine.resource.XHR = function(file, callback){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4 && xhr.status === 200){
			callback(xhr.responseText, xhr);
		}
	}
	xhr.open('GET', file, true);
	xhr.send();
}

//Load image at URL file (can be relative)
//Returns Image() and url to the callback
Engine.resource.loadImage = function(file, callback){
	var img = new Image();
	img.src = file;
	img.onload = function(){
		callback(img, file);
	}
}

//Load images from an array of URLS
//Calls callback, sending back the array, with Image()s instead of URLS
//Optionally, for every image that loads callbackPerImage is called, given the image loaded
Engine.resource.loadImages = function(files, callback, callbackPerImage){
	var file,
		loadedCount = 0;
	
	for(i in files){
		file = files[i];
		
		Engine.resource.loadImage(file, function(img, url){
			//Replace URL with Image()
			files[files.indexOf(url)] = img;
			
			//If the per-image callback is specified, trigger it
			if(callbackPerImage)
				callbackPerImage(img);
			
			//Update loaded image count
			loadedCount ++;
			
			//If all images have been loaded, trigger callback with array of images
			if(loadedCount === files.length){
				callback(files);
			}
		});
	}
}

//Given an object (typically parsed JSON) this will recursively call itself and its helpers to replace all strings in an advanced structure (can contain objects, arrays and strings, infinitely nested) with Image()s
//Takes the object in question and populates it, returning it to callback when finished
//Also allows for an optional callbackPerImage parameter, which gets executed for every image loaded (the just loaded image is passed)
Engine.resource.loadImageObject = function(obj, callback, callbackPerImage){
	//Initialise data variables
	//Total image count is updated as the object is cycled through
	//Loaded image count is updated as images are loaded (duh)
	Engine.resource.data.totalImages = Engine.resource.data.loadedImages = 0;
	
	//Because lol
	//And because I have a newfound hate for primitives
	if(typeof obj !== 'object'){
		throw new Error('Why have you done this to me, primitive ' + (typeof obj) + ' type? I need an object or an array to start off with!');
	}
	
	//Store parameters
	Engine.resource.data.loadImageObjectData = obj;
	Engine.resource.data.loadImageObjectCallback = callback;
	Engine.resource.data.loadImageObjectCallbackPerImage = callbackPerImage;
	
	//Start the cycle
	Engine.resource.loadImageObjectTypeDetect(obj);
}

//Helper function for Engine.resource.loadImageObject
//Given a node present in the object passed to Engine.resource.loadImageObject it will
//Detect the type
//And based on the type, call the appropriate helper function with that node
//Takes an origin describing object, so that if the value is a string (and therefore passed by value, not reference) it has a way of replacing the original string
//Goddamnit JavaScript
Engine.resource.loadImageObjectTypeDetect = function(node, origin){
	if(typeof node === 'string'){
		Engine.resource.loadImageObjectString(node, origin);
	}else if(Array.isArray(node)){
		Engine.resource.loadImageObjectArray(node);
	}else if(typeof node === 'object'){
		Engine.resource.loadImageObjectNamespace(node);
	}
}

//Helper function for Engine.resource.loadImageObject
//Runs through a namespace and finds all nodes
Engine.resource.loadImageObjectNamespace = function(namespace){
	for(key in namespace){
		Engine.resource.loadImageObjectTypeDetect(namespace[key], {origin: namespace, i: key});
	}
}

//Helper function for Engine.resource.loadImageObject
//Runs through an array and finds all nodes
Engine.resource.loadImageObjectArray = function(array){
	for(i in array){
		Engine.resource.loadImageObjectTypeDetect(array[i], {origin: array, i: i});
	}
}

//Helper function for Engine.resource.loadImageObject
//Changes a string node to an Image()
Engine.resource.loadImageObjectString = function(string, origin){
	//Because JavaScript has no pointers (grrr), to change the string you need to change this variable:
	//origin.origin[origin.i]
	
	//Increment total image count
	Engine.resource.data.totalImages ++;
	
	Engine.resource.loadImage(origin.origin[origin.i], function(img){
		//Replace the URL with the Image()
		origin.origin[origin.i] = img;
		
		//Image has loaded, update counter
		Engine.resource.data.loadedImages ++;
		
		//If a callback for every image loaded is in place, call it
		if(Engine.resource.data.loadImageObjectCallbackPerImage)
			Engine.resource.data.loadImageObjectCallbackPerImage(img);
		
		//If all images have been loaded, trigger overall callback
		if(Engine.resource.data.loadedImages === Engine.resource.data.totalImages){
			//Send the images back as a clone of the original object
			//It has to be cloned because otherwise it'll just be wiped
			var clone = {};
			for(key in Engine.resource.data.loadImageObjectData){
				clone[key] = Engine.resource.data.loadImageObjectData[key];
			}
			Engine.resource.data.loadImageObjectCallback(clone);
			
			//Also, clear stored data
			Engine.resource.data.totalImages = Engine.resource.data.loadedImages = 0;
			Engine.resource.data.loadImageObjectData = {};
			Engine.resource.data.loadImageObjectCallback = null;
			Engine.resource.data.loadImageObjectCallbackPerImage = null;
		}
	});
}

//LPC Sprites
Engine.resource.LPC = {
	frames: {
		spell: {
			row: 0,
			frames: 7
		}, thrust: {
			row: 4,
			frames: 8
		}, walk: {
			row: 8,
			frames: 8,
			start: 1
		}, slash: {
			row: 12,
			frames: 6
		}, shoot: {
			row: 16,
			frames: 13
		}, hurt: {
			row: 20,
			frames: 6,
			fourway: false
		}, idle: {
			rows: [8,9,10,11],
			column: 0
		}
	},
	getFrame: function(action, direction, frame){
		var d = this.frames[action];
		if(!d) return;
		d.fourway = d.fourway === false ? false : true;
		d.start === d.start !== 0 ? d.start : 0;

		if(d.rows){
			return {
				x: 64 * d.column,
				y: 64 * d.rows[(direction + 2) % 4 % d.rows.length]
			}
		}

		return {
			x: 64 * (frame % d.frames + d.start),
			y: 64 * (d.row + (d.fourway ? (direction + 2) % 4 : 0))
		}
	}
}