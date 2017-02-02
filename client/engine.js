var Engine = {}

//Misc

//rAF polyfill
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

//disable context menu on right click to allow for right click functionality within game
 document.body.addEventListener('contextmenu', function(e){
	if(e.preventDefault !== undefined) e.preventDefault();
	if(e.stopPropagation !== undefined) e.stopPropagation();
	
	return false;
});