//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var spawn = require("child_process").spawn;
var express = require('express');

//Lets define a port we want to listen to
const PORT = 8081;
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
game.secretCodes = [];
game.status="pending";
var counterInterval;

app.get('/readTime', function (req, res) {
   fs.readFile( __dirname + "/" + database, 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
});

app.get('/game/players', function(req, res){
	var publicPlayers = game.players;

	res.send({players: game.players});
});

app.get('/game/status', function(req, res){
	res.send({status: game.status});
});



app.post('/new/player', function(req, res){
	console.log(req.body);
	var player = {
		id : game.players.length,
		name : req.body.name,
		role : "CT",
		riddle: {
			type: "sum",
			inputValues: {
				val1: 1,
				val2: 2
			}
		}
	};

	game.players.push(player);
	game.secretCodes.push({
		code: (Math.floor(Math.random() *10)),
		status: "hidden"
	});
	res.send({id: player.id});

});


app.post('/game/end', function(req, res) {
	game.status = 'end';
	var game={};
	game.players = [];
	game.status = "end";
	clearInterval(counterInterval);
	res.send({end : true });
});

app.post('/new/game', function(req, res) {
	if (!game){
		game={};
		game.players=[];
	}
	game.players=[];
	game.players.push({
		id: 0,
		name: req.body.name || "Leader",
		role: "Leader",
		puzzle: {
			type: "sum",
			inputValues: {
				val1: 1,
				val2: 2
			}

		}
	});
	game.conf = req.body;
	game.status = 'pending';
	res.send("Game started");
});

app.post('/game/start', function(req, res) {
	game.status = 'inprogress';
	game.timeRemaining = timeHandler.convertTimeToEpoch(game.conf.time);
	timeHandler.saveTimeToFile();
	timeHandler.countdown();
	console.log(game.conf.time);
	res.send({time : game.timeRemaining});	
});


var puzzle = {
	sum: function(inputValues) {
		return inputValues.val1 + inputValues.val2;
	}
}

/*
 return
 czas do konca
 zagadki
 secretCode
 idBeaconow
  */

app.get('/game/:id', function (req, res){
	var player;
	var i = game.players.length;
	while (i--){
		if (req.params.id == game.players[i]){
			player=game.players[i];
			break;
		}
	};
	res.send({
		time: game.timeRemaining,
		puzzle: {
			type: "sum",
			inputValues: {
				val1: 1,
				val2: 2
			}
		}
	});
});


//kto, zagadka, rozwiazanie

app.post('/try/solve', function (req, res){
	var id = req.body.id;
	var i = game.players.length;

	var player;
	for (var i= 0; i< game.players.length; i++){

		if (id == game.players[i].id){
			player=game.players[i];
			break;
		}
	};
	console.log("SIEMA"+player);
	//console.log(puzzle[player.puzzle.type](player.puzzle.inputValues));
	console.log(player.puzzle.type);
	if (req.body.riddleAns == puzzle[player.puzzle.type](player.puzzle.inputValues)){
		var code;
		for (var i= 0; i< game.secretCodes.length; i++){
			if (game.secretCodes[i].status == "hidden"){
				code = game.secretCodes[i];
				game.secretCodes[i].status = "revealed";
				break;
			}
		}
		res.send({secretCode: code.code});
	}
});





// POST http://localhost:8080/api/users
// parameters sent with
app.post('/updateTime', function(req, res) {
	var dt = req.body.dt;
	timeHandler.updateFile(dt, function(){
		res.send(dt);
	});
});


//Create a server
//var server = http.createServer(handleRequest);
//Lets start our server
var server = app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);

	puzzle.sum([1,2]);
});



var timeHandler = {
	countdown: function(){
		var dt;
		counterInterval = setInterval(function(){
			dt = Math.floor(game.timeRemaining/1000)-(Math.floor(Date.now()/1000));
			console.log(dt);
			if (dt <= 0){
				game.status = "end";
				clearInterval(counterInterval);
			}

		}, 1000);
	},
	saveTimeToFile: function(){
		fs.writeFile(database,JSON.stringify({"timeRemaining":game.timeRemaining}));
	},
	convertTimeToEpoch: function(min){
		return  Date.now()+min*60000;
	},
	updateFile: function(dt, callback){
		 fs.readFile(database, function(err, data){
			var objFile = JSON.parse(data);
			objFile.realTime = timeHandler.updateRealTime();
			objFile.timeRemaining = timeHandler.updateTimeRemaining(objFile.timeRemaining, dt);
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