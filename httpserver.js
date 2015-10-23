//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');

//Lets define a port we want to listen to
const PORT=8081; 
var database = 'database.json';


var express = require('express');

var app = express();

app.get('/readTime', function (req, res) {
   fs.readFile( __dirname + "/" + database, 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// POST http://localhost:8080/api/users
// parameters sent with 
app.post('/modifyTime', function(req, res) {
    
	res.send('It Works!! Path Hit: ' + req.url);
    //res.send(user_id + ' ' + token + ' ' + geo);
});


//Create a server
//var server = http.createServer(handleRequest);
//Lets start our server
var server = app.listen(PORT, function(){
	fs.readFile(database, function(err, data){
		var data = JSON.parse(data);
		console.log(data);
		data.realTime = timeHandler.updateRealTime();
		data.timeRemaining = 3;
		console.log(data);
		fs.writeFile(database,JSON.stringify(data));
	});
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

var timeHandler = {
	updateRealTime: function(){
		return new Date().getTime();
	}
}