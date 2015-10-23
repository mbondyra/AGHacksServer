//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');

//Lets define a port we want to listen to
const PORT=8081; 
var database = 'database.json';
var spawn = require("child_process").spawn;
var express = require('express');

var app = express();
var bodyParser = require('body-parser');
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
	
	//spawn('/usr/bin/sudo', ['/usr/bin/python', "/home/pi/System/start_led.py", '3']);

    //res.send(user_id + ' ' + token + ' ' + geo);
});


//Create a server
//var server = http.createServer(handleRequest);
//Lets start our server
var server = app.listen(PORT, function(){
	var realTime = new Date().getTime();
	var timeRemaining = realTime+60;
    console.log("Server listening on: http://localhost:%s", PORT);
});



var timeHandler = {
	updateFile:function(dt, callback){
		console.log(dt);
		callback()
	},
	
	
	/*, callback){
		fs.readFile(database, function(err, data){
			var data = JSON.parse(data);
			console.log(data);
			data.realTime = timeHandler.updateRealTime();
			data.timeRemaining = timeHandler.updateTimeRemaining(data.timeRemaining, dt);
			console.log(data);
			fs.writeFile(database,JSON.stringify(data));
			callback();
		});
	},*/
	updateRealTime: function(){
		return new Date().getTime();
	},
	updateTimeRemaining: function(time, dt){
		return time+dt;
	}
}

