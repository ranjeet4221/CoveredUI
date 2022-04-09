
require('dotenv').config()
var express = require('express');
var app = express();
 var port = process.env.port || 8080;
//var port = process.env.port || 3000;
var methods = require('./selfexecute.js') 
var bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: true }));
// create application/json parser
app.use(bodyParser.json());


var deviceController = require('./devicecontroller')();
var ratingController = require('./rating/ratingcontroller');
//var apiController = require('./api/apicontroller');
//app.use("/api/devices", deviceController);
app.use("/api/HirerUser", deviceController);
//app.use("/api/HirerUser", apiController);

//app.use("/api/rating", ratingController);


const server = app.listen(port, function () {
    var datetime = new Date();
    var message = "Server runnning on Port:- " + port + "Started at :- " + datetime;
    console.log(message);
    setInterval(function(){
    methods['selfexecutefunc']();
    },1000000); // every 8 minutes
    //1000000
    setInterval(function(){
      ratingController.ratings();
     },3200000); // every 8 minutes
});


