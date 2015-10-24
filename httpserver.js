//Lets require/import the HTTP module
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var spawn = require("child_process").spawn;

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

var game ={};
	game.players=[];

var	counterInterval;

app.get('/game/players', function(req, res){
	res.send({players: game.players});
});

app.get('/game/status', function(req, res){
	res.send({status: game.status});
});

app.get('/game/:id', function (req, res){
	var id=req.params.id;
	var player = getPlayerById(req.params.id);
	if (player === -1){
		res.send({
			error:"User does not exist"
		});
	} else {
		res.send({
			time: game.timeEnd,
			puzzle: player.puzzle
		});
	}
});

app.post('/new/player', function(req, res){
	var player = new Player(game.players.length, req.body.name);
	game.players.push(player);
	game.secretCodes.push(new SecretCode());
	res.send({id: player.id});

});

app.post('/new/game', function(req, res) {

	var leader = new Player(0, req.body.name||"Leader");
	game = {
		players:[leader],
		secretCodes:[],
		status:"pending",
		conf:req.body
	};
	res.send("Game started");
});

app.post('/game/start', function(req, res) {
	game.status = 'inprogress';
	game.timeEnd = Date.now()+60000 * (game.conf.time);
	countdown();
	res.send({
		time : game.timeEnd
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
	if (id === -1){
		res.send ({
			error: "Player does not exist"
		});
	} else if (id != 0) {
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
			res.send({secretCode: -1});
		}
	} else {
		//losuj nowa zagadkê
		player.puzzle = Puzzle[Puzzle.getRandomPuzzle()].createNew();

		if (req.body.result == Puzzle[player.puzzle.type].result(player.puzzle.inputValues)) {
			//game.timeEnd+=5000;
		}	else {
			//game.timeEnd-=5000;
		}
		res.send({
			time: game.timeEnd,
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

var SecretCode = function(){
	this.code = Math.floor(Math.random()*10);
	this.status = "hidden";
}

var Player = function (id, name){
	this.id = id;
	this.name = name;
	if (id == 0) {
		this.role = "Leader"
	} else {
		this.role = "CT";
	};
	this.puzzle = Puzzle[Puzzle.getRandomPuzzle()].createNew();
};

var getPlayerById =  function (id){
	for (var i = 0; i < game.players.length; i++){
		if (id == game.players[i].id){
			return game.players[i];
		}
	};
	return -1;
};


var Puzzle;
Puzzle = {
	getRandom: function (min, max){
		return Math.floor(Math.random()*(max-min+1)+min)
	},
	getRandomPuzzle: function (){
		var arr= [ "sum", "convertbase", "simon" ];
		return arr[Puzzle.getRandom(0,arr.length-1)];
	},
	sum: {
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
	convertbase: {
		result : function (inputValues) {
			var num = parseInt(inputValues.number, inputValues.in_base);
			return num.toString(inputValues.out_base);
		},

		createNew : function () {
			var standardBases = [2,8,10,16];
			var in_base = standardBases[Puzzle.getRandom(0,3)];
			var out_base = standardBases[Puzzle.getRandom(0,3)];
			while (in_base == out_base){
				out_base = standardBases[Puzzle.getRandom(0,3)];
			}
			return {
				type:"convertbase",
				inputValues: {
					number: parseInt(Puzzle.getRandom(1,32),in_base),
					in_base : in_base,
					out_base : out_base
				}
			}
		}
	},
	simon:{
		result : function() {
			return true;
		},
		createNew: function(){
			var inputValues = {};
			var seq="";
			for (var i = 0; i < 12; i++){
				seq += Puzzle.getRandom(0,9);
			}
			return {
				type: "simon",
				inputValues: {
					seq:seq
				}
			}
		}
	},
	ledfun: {
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

var countdown =  function() {
	var dt;
	counterInterval = setInterval(function () {
		dt = Math.floor(game.timeEnd / 1000) - (Math.floor(Date.now() / 1000));
		if (dt <= 0) {
			game.status = "end";
			clearInterval(counterInterval);
		}
	}, 1000);
};
