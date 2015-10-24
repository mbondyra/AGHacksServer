//Lets require/import the HTTP module
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');

const PORT = 8081;

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};

var logger = function(log){
	console.log(log);
}

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(allowCrossDomain);

var game = {};
game.players = [];
game.secretCodes = [];
game.status = "pending";
var counterInterval;


app.get('/game/players', function(req, res){
	res.send({players: game.players});
});

app.get('/game/status', function(req, res){
	res.send({status: game.status});
});

app.get('/game/:id', function (req, res){
	var player = getPlayerById(req.params.id);
	res.send({
		time: game.timeRemaining,
		puzzle: player.puzzle
	});
});

var Player = function (id, name){
	this.id = id;
	this.name = name;
	this.role = function (){
		id==0?"Leader":"CT";
	};
	this.puzzle = Puzzle.Sum.createNew();
};

var getPlayerById =  function (id){
	for (var i = 0; i < game.players.length; i++){
		if (id == game.players[i].id){
			return game.players[i];
		}
	};
};


app.post('/new/player', function(req, res){
	var player = new Player(game.players.length, req.body.name);
	game.players.push(player);
	game.secretCodes.push({
		code: (Math.floor(Math.random() * 10)),
		status: "hidden"
	});
	res.send({id: player.id});

});


app.post('/new/game', function(req, res) {
	if (!game){
		game = {};
	}
	game.players = [];
	game.players.push(new Player(0, req.body.name||"Leader"));
	game.conf = req.body;
	game.status = 'pending';
	res.send("Game started");
});

app.post('/game/start', function(req, res) {
	game.status = 'inprogress';
	game.timeRemaining = timeHandler.convertTimeToEpoch(game.conf.time);
	timeHandler.countdown();
	res.send({
		time : game.timeRemaining
	});
});

app.post('/game/end', function(req, res) {

	var game={};
	game.players = [];
	game.status = "end";
	clearInterval(counterInterval);
	res.send({end : true });
});


app.post('/try/solve', function (req, res){
	var id = req.body.id;
	var player = getPlayerById(id);

	if (id != 0) {
		if (req.body.result == puzzle[player.puzzle.type].result(player.puzzle.inputValues)) {
			var code;
			for (var i = 0; i < game.secretCodes.length; i++) {
				if (game.secretCodes[i].status == "hidden") {
					code = game.secretCodes[i];
					game.secretCodes[i].status = "revealed";
					break;
				}
			}
			if (code && code.code) {
				res.send({secretCode: code.code});
			}
		} else {
			res.send({secretCode: -1})
		}
	} else {
		//losuj nowa zagadkê
		player.puzzle = Puzzle.Sum.createNew();

		if (req.body.result == puzzle[player.puzzle.type].result(player.puzzle.inputValues)) {
			game.timeRemaining+=5000;
		}	else {
			game.timeRemaining-=5000;
		}
		res.send({
			time: game.timeRemaining,
			puzzle: player.puzzle
		});
	}
});


//Create a server
//var server = http.createServer(handleRequest);
//Lets start our server
var server = app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

var Puzzle;
Puzzle = {
	getRandom: function(min, max){
		return Math.floor(Math.random()*(max-min+1)+min)
	},
	Sum: {
		result : function (inputValues) {
			return inputValues.val1 + inputValues.val2;
		},
		createNew : function (){
			return {
				type:"sum",
				inputValues:{
					val1:Puzzle.getRandom(1,10),
					val2:Puzzle.getRandom(1,10)
				}
			}
		}
	},
	ConvertBase: {
		getRandomBase: function(){
			var standardBases = [2,8,10,16];
			return standardBases[Puzzle.getRandom(0,3)];
		},
		result : function (inputValues) {
			var num = parseInt(inputValues.number, inputValues.in_base);
			return num.toString(inputValues.out_base);
		},

		createNew : function () {
			return {
				type:"convertBase",
				inputValues: {
					number: Puzzle.getRandom(1,10),
					in_base : Puzzle.ConvertBase.getRandomBase(),
					out_base : Puzzle.ConvertBase.getRandomBase()
				}
			}
		}
	},
	Simon:{
		result : function() {
			return true
		},
		createNew: function(){
			var inputValues = [];
			for (var i = 0; i < 12; i++){
				inputValues += Puzzle.getRandom(0,9);
			}
			return {
				type: "Simon",
				inputValues: inputValues
			}
		}
	},
	LedFun: {
		createNew: function (){
			var ledCombination = [{

			},{

			}
			];
			var rules = [

			];
		}
	}
};

var timeHandler = {
	countdown: function(){
		var dt;
		counterInterval = setInterval(function(){
			dt = Math.floor(game.timeRemaining/1000)-(Math.floor(Date.now()/1000));
			if (dt <= 0){
				game.status = "end";
				clearInterval(counterInterval);
			}
		}, 1000);
	},
	convertTimeToEpoch: function(min){
		return  Date.now()+min*60000;
	},
}