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
const { Pool } = require("pg");

//the following will create a router for implementing the database api
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var indexRouter = require('./public/index');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', indexRouter);

module.exports = app;
//end

app = express();

// load all of the files
app.use(express.static(path.join(__dirname + "public")));

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "public/index.html"));
});

app.listen(PORT, () => {
  console.log(
    "Server running at https://rateyourgames.heroku.com/ using port" + PORT
  );
});
