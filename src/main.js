// This file will be the main router
// that handles get and post requests
// to the website, and so it launches all
// pages

// handle backend connections (node)
const express = require("express");
const path = require("path");
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

client.connect();

app = express();

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
  res.sendFile(path.join(__dirname + "/public/login.html"));
});

app.listen(PORT, () => {
  console.log(
    "Server running at https://rateyourgames.heroku.com/ using port" + PORT
  );
});
