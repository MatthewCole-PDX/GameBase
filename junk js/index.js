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

app = express();

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
  client.query('SELECT name FROM ' + req.body.category + 'WHERE name LIKE ' + req.body.searchFor +';', (err, res) => {
    if (err) throw err;
    client.connect();

    res.set({"Content-Type": "text/html"});
    for (let row of res.rows) {
      res.write(JSON.stringify(row));
    }
    client.end();
  });
};
  //var input = document.getElementById("searchFor");
  //var category = document.getElementById("category");
  //var result = '';



