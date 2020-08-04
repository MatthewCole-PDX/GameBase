/*const express = require('express');
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

app.use(
  parser.urlencoded({
    extended: false,
    limit: 1024,
  })
);
*/

var logIn = document.getElementById("logIn");
var chart = document.getElementById("chart");
var search = document.getElementById("submit");

//jump to logIn.html
logIn.onclick = function () {
  window.location.assign("logIn.html");
};

//jump to chart.html
chart.onclick = function () {
  window.location.assign("chart.html");
};

search.onclick = function() {
  window.location.assign("search.html");
};
/*
app.post("/search", (req, res) => {
  var input = document.getElementById("searchFor");
  var category = document.getElementById("category");
  //var result = '';
  client.query('SELECT name FROM ' + category + 'WHERE name LIKE ' + input +';', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
  res.sendfile(path.join(__dirname + '/public/search.html'));

});*/



