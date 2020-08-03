const express = require('express');
const app = express();
const path = require('path');
var parser = require('body-parser');

const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();


app.use(express.static(path.join(__dirname, '/public')));



var search = document.getElementById("search");
var logIn = document.getElementById("logIn");
var chart = document.getElementById("chart");

//jump to logIn.html
logIn.onclick = function () {
  window.location.assign("logIn.html");
};

//jump to chart.html
chart.onclick = function () {
  window.location.assign("chart.html");
};

search.onclick = function() {
  var searchFor = req.body.search  
  res.send(result);
    window.location.assign("search.html");
}