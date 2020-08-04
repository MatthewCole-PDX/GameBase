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
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
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

var loggedIn = false;

// load all of the files
app.use(express.static(path.join(__dirname + "/public")));

app.get("/", (req, res) => {
  res.status(200);
  if(!loggedIn){
  res.sendFile(path.join(__dirname + "/public/index.html"));
  }
  else{
    //send logged in version of index.html
  }
});

// add possibility for manual navigation
app.get("/chart", (req, res) => {
  res.status(200);
  if(!loggedIn){
    res.sendFile(path.join(__dirname + "/public/chart.html"));
  }
  else{
    //send logged in version of chart.html
  }
});

app.get("/login", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/public/logIn.html"));
  //not visible if logged in
});

app.get("/createNewUser", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/public/form.html"));
});

app.post("/newUserAdded", (req,res) => {
  res.status(200);
  client.connect();
  client.query('INSERT INTO users(user_name, password, email) VALUES (req.body.name, req.body.password, req.body.email);');
    if (err) throw err;
  client.end();
  res.sendFile(path.join(__dirname + "/public/newUserAdded.html"));
});

app.get("/checkCredentials", (req, res)=>{
  res.status(200)
  //find name in database
  //if found
  //loggedIn=TRUE
  //sendfile /:user
  //else sendfile form
});

app.post("/search", (req, res) => {
  res.status(200);
  var search = ("Searching for " + req.body.searchFor + " in " + req.body.category);
  //res.sendFile(path.join(__dirname + "/public/search.html"));
  
  client.connect();
  client.query('SELECT name FROM ' + req.body.category + 'WHERE name LIKE ' + req.body.searchFor +';', (err, res) => {
    if (err) throw er;
    res.set({"Content-Type": "text/html"});
    for (let row of res.rows) {
      search += JSON.stringify(row);
      search += '</br>';
    }
    client.end();
    res.send(search);
  });
  
});

app.listen(PORT, () => {
  console.log(
    "Server running at https://rateyourgames.heroku.com/ using port" + PORT
  );
});
