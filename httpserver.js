//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var spawn = require("child_process").spawn;
var express = require('express');

//Lets define a port we want to listen to
const PORT=8081; 
var database = 'database.json';

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/readTime', function (req, res) {
   fs.readFile( __dirname + "/" + database, 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
});

// POST http://localhost:8080/api/users
// parameters sent with 
app.post('/updateTime', function(req, res) {
    //getCurrentTime
	var dt = req.body.dt;
	console.log('siema, tu post'+dt);
	timeHandler.updateFile(dt, function(){
		res.send(dt);
	});
});

var conf;

app.post('/new/game', function(req, res) {
    //getCurrentTime
	conf = req.body;
	conf.timeRemaining = timeHandler.convertTimeToEpoch(conf.time);
	timeHandler.saveTimeToFile();
	console.log("kons")
	res.send("Game started");
});


//Create a server
//var server = http.createServer(handleRequest);
//Lets start our server
var server = app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});


var timeHandler = {
	saveTimeToFile: function(){
		fs.writeFile(database,JSON.stringify({"timeRemaining":conf.timeRemaining}));
	},
	convertTimeToEpoch:function(min){
		return new Date().getTime() + min * 60;
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

