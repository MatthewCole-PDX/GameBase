// This file will be the main router
// that handles get and post requests
// to the website, and so it launches all
// pages

// handle backend connections (node)
const express = require("express");
const path = require("path");
var parser = require("body-parser");
// heroku has an environment variable
// that determines port
const PORT = process.env.PORT || 5000;
// pool controls connections to the postgres db
const { Pool } = require("pg");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const pool = new Pool({
  connectionString:
    "postgres://sajfopicqfjqpa:0207c07d082bbe7f11ebc9fe5e8dafb13796b05c0ea7a336d47ba14ecd57bef4@ec2-52-207-124-89.compute-1.amazonaws.com:5432/dc1qe778cvpm8r",
  ssl: {
    rejectUnauthorized: false,
  },
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
app.set("views", __dirname + "/public/frontend");
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.status(200);
  res.render("index", { sec1: "test" });
  /*if (!loggedIn) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
  } else {
    //send logged in version of index.html
  }*/
});

// add possibility for manual navigation
app.get("/chart", (req, res) => {
  res.status(200);
  if (!loggedIn) {
    res.sendFile(path.join(__dirname + "/public/chart.html"));
  } else {
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

app.post("/newUserAdded", (req, res) => {
  res.status(200);
  client.connect();
  client.query(
    "INSERT INTO users(user_name, password, email) VALUES (req.body.name, req.body.password, req.body.email);"
  );
  if (err) throw err;
  client.end();
  res.sendFile(path.join(__dirname + "/public/newUserAdded.html"));
});

app.get("/checkCredentials", (req, res) => {
  res.status(200);
  //find name in database
  //if found
  //loggedIn=TRUE
  //sendfile /:user
  //else sendfile form
});

app.post("/search", async (req, res) => {  
  res.status(200);
  var searchResults = [];
  if (req.body.category == "games") {
    try {
      const client = await pool.connect();
      const result = await client.query(
        //"SELECT * FROM games;"
        "SELECT DISTINCT games.game_id AS game_id, games.name AS name" +
          ", consoles.name AS Console" +
          ", TO_CHAR(releases.release_date,'MM/DD/YYYY') AS First_Release, companies.name AS Publisher, releases.region AS Region" +
          ", string_agg(DISTINCT genres.name, ', ') AS Genres" +
          " FROM games " +
          "JOIN releases ON games.game_id = releases.game_id " +
          "INNER JOIN consoles ON releases.console_id = consoles.console_id " +
          "INNER JOIN companies ON releases.publisher_id = companies.company_id " +
          "INNER JOIN genre_rel ON games.game_id = genre_rel.game_id " +
          "INNER JOIN genres ON genre_rel.genre_id = genres.genre_id " +
          "WHERE LOWER(games.name) LIKE LOWER('%" + req.body.searchFor + "%')" +
          " AND releases.first_release = 'yes'" +
          " GROUP BY games.game_id, games.name, Console, releases.release_date, Publisher, releases.region" +
          ";"
      );
      var results = { results: result ? result.rows : null };
      console.log(results);
      //res.render("search");
      for(var i = 0; i < result.rows.length; i++){
        var game = {
          'game_id':result.rows[i].game_id,
          'name':result.rows[i].name,
          'console':result.rows[i].console,
          'first release':result.rows[i].first_release,
          'publisher':result.rows[i].publisher,
          'region':result.rows[i].region,
          'genres':result.rows[i].genres
        }
        searchResults.push(game);
      }
      res.render("search", { 
        "games": searchResults 
      });
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
});

// create a chart given a query from the chart page
app.post('/gen', async (req, res) => {
  try {
    res.status(200);

    // log the inputs of the form the console
    console.log('Console: ' + req.body.Console);
    console.log('Company: ' + req.body.Company);
    console.log('Genre: ' + req.body.Genre);

    // touch postgres DB server
    const client = await pool.connect();

    // generate query
    // use temp query for now
    const result = await client.query('SELECT * FROM users;');
    const results = { results : result ? result.rows : null }; 
    res.send(results);
    console.log(results);
    client.release();
  } catch(err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.listen(PORT, () => {
  console.log(
    "Server running at https://rateyourgames.heroku.com/ using port" + PORT
  );
});
