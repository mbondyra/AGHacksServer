//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var spawn = require("child_process").spawn;
var express = require('express');

//Lets define a port we want to listen to
const PORT=8081; 
var database = 'database.json';

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(allowCrossDomain);

var game={};
game.players = [];
game.status="pending";

app.get('/readTime', function (req, res) {
   fs.readFile( __dirname + "/" + database, 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
});

app.get('/game/players', function(req, res){
	res.send({players: game.players});
});

app.get('/game/status', function(req, res){
	res.send({"status":game.status});
});

// POST http://localhost:8080/api/users
// parameters sent with 
app.post('/updateTime', function(req, res) {
	var dt = req.body.dt;
	console.log('siema, tu post'+dt);
	timeHandler.updateFile(dt, function(){
		res.send(dt);
	});
});

app.post('/new/player', function(req, res){
	console.log(req.body);
	var player = {
		id : game.players.length,
		name : req.body.name,
		role : "CT" 
	};
	game.players.push(player);
	res.send({id: player.id});
	
});



app.post('/game/finish', function(req, res) {
	game.status = 'end';
	res.send({end : true });
});

app.post('/new/game', function(req, res) {
	if (!game){
		game={};
		game.players=[];
	}
	game.players.push({
		id: 0,
		name: req.body.name || "Leader",
		role: "Leader"
	});
	
	game.conf = req.body;
	game.status = 'pending';
	res.send("Game started");
});

app.post('/game/start', function(req, res) {
	game.status = 'inprogress';
	game.timeRemaining = timeHandler.convertTimeToEpoch(game.conf.time);
	timeHandler.saveTimeToFile();
	console.log(game.conf.time);
	res.send({time : game.timeRemaining});	
});

//Create a server
//var server = http.createServer(handleRequest);
//Lets start our server
var server = app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});



var timeHandler = {
	saveTimeToFile: function(){
		fs.writeFile(database,JSON.stringify({"timeRemaining":game.timeRemaining}));
	},
	convertTimeToEpoch: function(min){
		return  Date.now()+min*60000;
	},
	updateFile: function(dt, callback){
		console.log(dt);
		 fs.readFile(database, function(err, data){
			var objFile = JSON.parse(data);
			console.log(objFile);
			objFile.realTime = timeHandler.updateRealTime();
			objFile.timeRemaining = timeHandler.updateTimeRemaining(objFile.timeRemaining, dt);
			console.log(objFile);
			fs.writeFile(database,JSON.stringify(objFile));
			callback();
		});
	},
	updateRealTime: function(){
		return new Date().getTime();
	},
	updateTimeRemaining: function(time, dt){
		return time+dt;
	}
}