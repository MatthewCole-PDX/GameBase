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
*/


app.use(
  parser.urlencoded({
    extended: false,
    limit: 1024,
  })
);


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

app.post("/search", (req, res) => {
  //var input = document.getElementById("searchFor");
  //var category = document.getElementById("category");
  //var result = '';
  
  client.query('SELECT name FROM ' + req.body.category + 'WHERE name LIKE ' + req.body.searchFor +';', (err, res) => {
    if (err) throw err;
    client.connect();
    res.status(200);
    res.set({"Content-Type": "text/html"});
    for (let row of res.rows) {
      res.write(JSON.stringify(row));
    }
    client.end();
  });
  res.sendfile(path.join(__dirname + '/public/search.html'));

});



