
/* Dependencies */

const app = require('express')();
const http = require('http').Server(app);
//const io = require('socket.io')(http);

const chalk = require('chalk');
const path = require('path');


/* Routing */

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.get('/*', function(req, res){
	res.sendFile(path.join(__dirname, 'client', req.params[0]));
});


/* Initialisation */

//If a (valid) port was supplied as a command line parameter (node index PORT_NO) then use it
//Otherwise, fall back to port 3000
const port = process.argv[2] ?
		process.argv[2].match(/[^0-9]+/g) ?
			3000 : parseInt(process.argv[2])
		: 3000;

http.listen(port, function(){
	console.log(chalk.cyan('Loaded to ') + chalk.blue('http://localhost:') + chalk.green.underline(port));
});
