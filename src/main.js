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

app.get("/", (req, res) => {
  res.status(200);
  if (!loggedIn) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
  } else {
    //send logged in version of index.html
  }
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
  if(req.body.category == 'games'){
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT DISTINCT games.game_id AS game_id, games.name AS Game'  
      + ', consoles.name AS Console'
      + ', TO_CHAR(releases.release_date,\'MM/DD/YYYY\') AS First_Release, companies.name AS Publisher, releases.region AS Region'
      + ', string_agg(DISTINCT genres.name, \', \') AS Genres'
      + ' FROM games '
      + 'JOIN releases ON games.game_id = releases.game_id '
      + 'INNER JOIN consoles ON releases.console_id = consoles.console_id '
      + 'INNER JOIN companies ON releases.publisher_id = companies.company_id '
      + 'INNER JOIN genre_rel ON games.game_id = genre_rel.game_id '
      + 'INNER JOIN genres ON genre_rel.genre_id = genres.genre_id '
      + 'WHERE games.name LIKE \'%' + req.body.searchFor + '%\''
      + ' AND releases.first_release = \'yes\''
      + ' GROUP BY games.game_id, Game, Console, releases.release_date, Publisher, releases.region'
      + ';');
      var results = { results: result ? result.rows : null };
      console.log(results);
      res.set('text/html');
      var htmlResult = '<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"'
         + 'integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>' +
      '<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"' +
      'integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>' +
      '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"' +
      'integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI" crossorigin="anonymous"></script>' +
      '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"' +
      'integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous"/>';
      var i = 1;
      for (let row of result.rows) {
        htmlResult += ( '<div class="container p-3 my-3 bg-light">'
                      + '<img src=\"images/game-' + row.game_id + '.jpg\" width=400px alt=\"' + path.join(__dirname + '/public/images/game-' + row.game_id + '.jpg') + '\">'
                      + '<h2>'+ i +'. <a href= \'/game/:' + row.game_id + '\'>' + row.game + ': </a></h2>'
                      + '&nbsp;&nbsp;' + row.genres + '&nbsp;-&nbsp;' + row.console + '&nbsp;-&nbsp;First Released:&nbsp;' + row.first_release + ' by ' + row.publisher + ' in ' + row.region + '</div>');
        i++;
      }
      res.send(htmlResult);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
});

app.listen(PORT, () => {
  console.log(
    "Server running at https://rateyourgames.heroku.com/ using port" + PORT
  );
  console.log(process.DATABASE_URL);
});
