
Engine.resource.XHR('demo.tmx', function(txt){
	var mapData = Engine.render.interpretCompressedMap(txt, '');
	Engine.render.loadMap(mapData);

	Engine.client.playing = true;

	Engine.client.setupCanvas();
	Engine.render.loop();
});

window.onresize = Engine.client.setupCanvas;
