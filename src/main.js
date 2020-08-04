// This file will be the main router
// that handles get and post requests
// to the website, and so it launches all
// pages

// handle backend connections (node)
const express = require("express");
const path = require("path");
var parser = require('body-parser');
// heroku has an environment variable
// that determines port
const PORT = process.env.PORT || 5000;
// pool controls connections to the postgres db
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

// load all of the files
app.use(express.static(path.join(__dirname + "/public")));

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

// add possibility for manual navigation
app.get("/chart", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/public/chart.html"));
});

app.get("/login", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/public/logIn.html"));
});

app.post("/search", (req, res) => {
  res.status(200);
  res.write("Searching for " + req.body.searchFor + " in " + req.body.category);
  //res.sendFile(path.join(__dirname + "/public/search.html"));
  /*
  client.connect();
  client.query('SELECT name FROM ' + req.body.category + 'WHERE name LIKE ' + req.body.searchFor +';', (err, res) => {
    if (err) throw err;
    res.set({"Content-Type": "text/plain"});
    for (let row of res.rows) {
      res.write(JSON.stringify(row));
    }
    client.end();
  });
  */
  
});

app.listen(PORT, () => {
  console.log(
    "Server running at https://rateyourgames.heroku.com/ using port" + PORT
  );
});
