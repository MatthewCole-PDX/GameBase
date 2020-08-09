// This file will be the main router
// that handles get and post requests
// to the website, and so it launches all
// pages

// handle backend connections (node)
const url = "https://restcountries.eu/rest/v2/all"; //api url
const express = require("express");
const path = require("path");
var parser = require("body-parser");
const fetch = require("node-fetch");
var clone; //clone the result api obj
var dataLength; //copy the length of api data
// heroku has an environment variable
// that determines port
const PORT = process.env.PORT || 5000;
// pool controls connections to the postgres db
const { Pool } = require("pg");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const { title } = require("process");
const { render } = require("pug");
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
var user_name = undefined;
var user_id = undefined;

// load all of the files
app.use(express.static(path.join(__dirname + "/public")));
app.set("views", __dirname + "/public/frontend");
app.set("view engine", "pug");

//get countries data
fetch(url)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    clone = Object.assign({}, data);
    dataLength = data.length;
  })
  .catch((error) => console.log(error));

app.get("/", async (req, res) => {
  res.status(200);
  var searchResults = [];
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT users.user_name, users.user_id, games.game_id, games.name, ratings.user_rating, ratings.user_review " +
        "FROM users " +
        "JOIN ratings " +
        "ON users.user_id = ratings.user_id " +
        "INNER JOIN releases " +
        "ON releases.release_id = ratings.release_id " +
        "INNER JOIN games " +
        "ON releases.game_id = games.game_id " +
        "WHERE ratings.user_review IS NOT NULL;"
    );
    const results = { results: result ? result.rows : null };
    let data = result.rows;
    for (let i = 0; i < data.length; i++) {
      var reviews = {
        user_id: data[i].user_id,
        user_name: data[i].user_name,
        game_id: data[i].game_id,
        name: data[i].name,
        user_rating: data[i].user_rating,
        user_review: data[i].user_review,
      };
      searchResults.push(reviews);
    }
    res.render("index", {
      title: "index",
      reviewData: searchResults,
      loggedIn: loggedIn,
      user_name: user_name,
    });
    //console.log(searchResults[0].user_name);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

// add possibility for manual navigation
app.get("/chart", async (req, res) => {
  res.status(200);
  var searchResults = [];
  try {
    const client = await pool.connect();

    // note that the view 'top' is the query
    // SELECT name, AVG(user_rating) AS avg
    // FROM ratings
    // NATURAL JOIN releases
    // NATURAL JOIN Games
    // GROUP BY name
    // ORDER BY avg;
    // 'top2' is the same but with game_id instead of name
    const select2 = await client.query("SELECT name FROM consoles;");
    console.log(select2);

    var consoles = [];
    for (var i = 0; i < select2.rows.length; i++) {
      var console1 = {
        name: select2.rows[i].name,
      };
      consoles.push(console1);
    }
    console.log(consoles);

    const select1 = await client.query(
      "SELECT DISTINCT name FROM companies, releases WHERE companies.company_id = releases.publisher_id;"
    );
    var publishers = [];
    for (var i = 0; i < select1.rows.length; i++) {
      var publisher = {
        name: select1.rows[i].name,
      };
      publishers.push(publisher);
    }
    console.log(publishers);

    const select3 = await client.query("SELECT name FROM genres;");
    var genres = [];
    for (var i = 0; i < select3.rows.length; i++) {
      var genre = {
        name: select3.rows[i].name,
      };
      genres.push(genre);
    }
    console.log(genres);
    const result = await client.query(
      //"SELECT * " + "FROM top " + "NATURAL JOIN top2 " + "ORDER BY avg;"
      "SELECT games.game_id, " +
        "games.name, consoles.console_id, consoles.name AS Console, companies.name AS Publisher, companies.company_id AS publisher_id, " +
        "TO_CHAR(releases.release_date,'MM/DD/YYYY') AS release_date, releases.region AS Region, string_agg(DISTINCT genres.name, ', ') AS Genres, rating.average AS average FROM " +
        "(SELECT release_id, round( avg(user_rating)::numeric, 2) AS average " +
        "FROM ratings GROUP BY release_id) AS rating " +
        "JOIN releases ON releases.release_id = rating.release_id " +
        "INNER JOIN games ON releases.game_id = games.game_id " +
        "INNER JOIN consoles ON releases.console_id = consoles.console_id " +
        "INNER JOIN companies ON releases.publisher_id = companies.company_id " +
        "INNER JOIN genre_rel ON games.game_id = genre_rel.game_id " +
        "INNER JOIN genres ON genre_rel.genre_id = genres.genre_id " +
        "WHERE releases.first_release = 'yes' " +
        "GROUP BY games.game_id, games.name, rating, rating.average, Console, consoles.console_id, releases.release_date, companies.company_id, Publisher, releases.region " +
        "ORDER BY average DESC;"
    );
    const results = { results: result ? result.rows : null };
    console.log(results);
    //let data = result.rows;
    //for (let i = data.length - 1; i >= 0; i--) {
    for (var i = 0; i < result.rows.length; i++) {
      var rating = {
        game_id: result.rows[i].game_id,
        name: result.rows[i].name,
        //user_rating: data[i].avg,
        console_id: result.rows[i].console_id,
        console: result.rows[i].console,
        release_date: result.rows[i].release_date,
        publisher_id: result.rows[i].publisher_id,
        publisher: result.rows[i].publisher,
        region: result.rows[i].region,
        rating: result.rows[i].average,
        genres: result.rows[i].genres,
      };
      searchResults.push(rating);
    }
    res.render("chart", {
      reviewData: searchResults,
      publishers: publishers,
      consoles: consoles,
      genres: genres,
      user_name: user_name,
      user_id: user_id,
      loggedIn: loggedIn,
    });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/logOut", (req, res) => {
  res.status(200);
  loggedIn = false;
  user_name = undefined;
  user_id = undefined;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.status(200);
  // res.sendFile(path.join(__dirname + "/public/logIn.html"));
  res.render("login", { Login_Failed: undefined });
  //not visible if logged in
});
app.post("/checkCredentials", async (req, res) => {
  res.status(200);
  if (!user_id) {
    try {
      const client = await pool.connect();
      var result = await client.query(
        "SELECT user_id FROM users WHERE LOWER(user_name) = " +
          "LOWER('" +
          req.body.name +
          "') AND password = '" +
          req.body.password +
          "';"
      );
      if (result.rows[0].user_id) {
        user_id = result.rows[0].user_id;
        user_name = req.body.name;
        loggedIn = true;
        console.log("Logged In! user-" + user_id);
        res.redirect("user/" + user_name);
      } else {
        res.render("login", {
          Login_Failed: " Incorrect User/Password, Please Try Again",
        });
        client.release();
      }
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  } else {
    res.redirect("user/" + user_name);
  }
});

app.get("/user/:user_name", async (req, res) => {
  res.status(200);
  if (req.params.user_name) {
    try {
      const client = await pool.connect();
      const result1 = await client.query(
        "SELECT user_name, user_id, email, " +
          "TO_CHAR(birth_date,'MM/DD/YYYY') AS birth_date, users.city AS city, users.country AS country, console_id, name " +
          "FROM users JOIN consoles ON consoles.console_id = users.favorite_console WHERE LOWER(users.user_name) = LOWER('" +
          req.params.user_name +
          "');"
      );

      var userInfo = {
        user_id: result1.rows[0].user_id,
        user_name: result1.rows[0].user_name,
        console_id: result1.rows[0].console_id,
        console: result1.rows[0].name,
        birth_date: result1.rows[0].birth_date,
        city: result1.rows[0].city,
        country: result1.rows[0].country,
      };
      const result2 = await client.query(
        "SELECT DISTINCT games.game_id AS game_id, games.name AS name, consoles.console_id AS console_id" +
          ", consoles.name AS Console, ratings.user_rating AS user_rating, ratings.user_review AS user_review, ratings.catalog AS catalog" +
          ", TO_CHAR(releases.release_date,'MM/DD/YYYY') AS First_Release, companies.company_id AS company_id, companies.name AS publisher, releases.region AS Region" +
          ", string_agg(DISTINCT genres.name, ', ') AS Genres" +
          " FROM games " +
          "JOIN releases ON games.game_id = releases.game_id " +
          "INNER JOIN consoles ON releases.console_id = consoles.console_id " +
          "INNER JOIN companies ON releases.publisher_id = companies.company_id " +
          "INNER JOIN genre_rel ON games.game_id = genre_rel.game_id " +
          "INNER JOIN genres ON genre_rel.genre_id = genres.genre_id " +
          "INNER JOIN ratings ON ratings.release_id = releases.release_id" +
          " WHERE releases.first_release = 'yes' AND ratings.user_id = '" +
          userInfo.user_id +
          "'" +
          " GROUP BY games.game_id, games.name, consoles.console_id, Console, releases.release_date, ratings.catalog, ratings.user_rating, ratings.user_review, companies.company_id, companies.name, releases.release_date, releases.region" +
          ";"
      );
      var userLibrary = [];
      for (var i = 0; i < result2.rows.length; i++) {
        var userEntry = {
          game_id: result2.rows[i].game_id,
          game_name: result2.rows[i].name,
          user_rating: result2.rows[i].user_rating,
          user_review: result2.rows[i].user_review,
          catalog: result2.rows[i].catalog,
          console_id: result2.rows[i].console_id,
          console: result2.rows[i].console,
          release_date: result2.rows[i].release_date,
          publisher_id: result2.rows[i].publisher_id,
          publisher: result2.rows[i].publisher,
          region: result2.rows[i].region,
          genres: result2.rows[i].genres,
        };
        userLibrary.push(userEntry);
      }
      res.render("user", {
        userLibrary: userLibrary,
        userInfo: userInfo,
        loggedIn: loggedIn,
        user_name: user_name,
      });
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
});
app.post("/postReview/:user_id/:game_id", async (req, res) =>{
  res.status(200);
  console.log(req.body.collection + ' ' + req.body.rating + ' ' + req.body.comments);
  console.log(req.params.game_id);
  try {
    const client = await pool.connect();
    const id = await client.query("SELECT release_id FROM releases WHERE releases.game_id = " + req.params.game_id +
                                  " AND releases.first_release = 'yes';");
    console.log(id.rows[0].release_id);
    await client.query("INSERT INTO ratings(user_id, release_id, user_rating, user_review, catalog) " +
    "VALUES (" + req.params.user_id + ", " + id.rows[0].release_id + ", '" + req.body.rating + "', '" + req.body.comments + "', '" + req.body.collection + "');"
    );
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }  
  //console.log(req.params.user_id + " post " + req.params.game_id + " " + id.rows[0].release_id);
  res.redirect("/game/" + req.params.game_id);
});
app.post("/editReview/:user_id/:game_id", async (req, res) =>{
  res.status(200);
  console.log(req.body.rating + ' ' + req.body.collection + ' ' + req.body.comments);
  try {
    const client = await pool.connect();
    const id = await client.query("SELECT release_id FROM releases WHERE releases.game_id = " + req.params.game_id +
                                  " AND releases.first_release = 'yes';");
    const result = await client.query("UPDATE ratings SET user_rating = '" + req.body.rating + "', user_review = '" + req.body.comments +
                                      "', catalog = '" + req.body.collection + "' WHERE user_id = " + req.params.user_id +
                                      "AND release_id = " + id.rows[0].release_id + ";");
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }  
  //console.log(req.params.user_id + " edit " + req.params.game_id + " " + id.rows[0].release_id);
  //console.log(req.body.rating + ' ' + req.body.collection + ' ' + req.body.comments);
  res.redirect("/game/" + req.params.game_id);
});

app.get("/createNewUser", (req, res) => {
  res.status(200);
  res.render("form");
});

app.post("/newUserAdded", async (req, res) => {
  res.status(200);
  
  // see if such a user already exists, if no error,
  // redirect to user page, else alert that the user
  // already exists

  var searchQuery = "SELECT * FROM users WHERE email = '" +
                    req.body.email + "' "
                    "OR user_name = '" +
                    req.body.name + "';";

  try {
    const client = await pool.connect();
    var valid = await client.query(searchQuery);
    if (valid.rows.length > 0) {
      client.end();
      alert("User already exists");
      res.render("form");
    } else {
    var Num = await client.query("SELECT user_id FROM users;");
    idNum = Num.rows.length;
    idNum++;
    console.log(idNum);
    console.log(req.body.name);
    console.log(req.body.password);
    console.log(req.body.email);

    var query = 'INSERT INTO users VALUES (' +
              "'" + idNum.toString() + "'," +
              "'" + req.body.name + "'," +
              "'" + req.body.password + "'," +
              "'" + req.body.email + "'," +
              "'2999-01-01'," +
              "'Portland'," +
              "'United States'," +
              '1);';

    var result = await client.query(query);
    user_name = req.body.name;
    user_id = idNum;
    client.end();
    res.render("login");
    }
  }
  catch (err) {
    console.error(err);
    res.send("Error" + err);
  }
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
          "WHERE LOWER(games.name) LIKE LOWER('%" +
          req.body.searchFor +
          "%')" +
          " AND releases.first_release = 'yes'" +
          " GROUP BY games.game_id, games.name, Console, releases.release_date, Publisher, releases.region" +
          ";"
      );
      //var results = { results: result ? result.rows : null };
      //console.log(results);
      //res.render("search");
      for (var i = 0; i < result.rows.length; i++) {
        var game = {
          game_id: result.rows[i].game_id,
          name: result.rows[i].name,
          console: result.rows[i].console,
          "first release": result.rows[i].first_release,
          publisher: result.rows[i].publisher,
          region: result.rows[i].region,
          genres: result.rows[i].genres,
        };
        searchResults.push(game);
      }
      res.render("search", {
        games: searchResults,
        user_name: user_name,
        loggedIn: loggedIn,
        user_id: user_id,
      });
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
});

app.get("/game/:game_id", async (req, res) => {
  res.status(200);
  //res.send(req.params.game_id);
  var id = req.params.game_id;
  try {
    const client = await pool.connect();
    const result = await client.query(
      //"SELECT * FROM games;"
      "SELECT games.game_id AS game_id, games.name AS name, consoles.console_id AS Console_id, " +
        "consoles.name AS Console, TO_CHAR(releases.release_date,'MM/DD/YYYY') AS Release_date, " +
        "companies.company_id AS Publisher_id, companies.name AS Publisher, " +
        "(SELECT DISTINCT string_agg(companies.name, ', ') AS Developers FROM companies " +
        "JOIN developer_rel ON developer_rel.developer_id = companies.company_id " +
        "WHERE developer_rel.game_id = '" +
        id +
        "'), " +
        "(SELECT DISTINCT string_agg(designers.name, ', ') AS Designers FROM designers " +
        "JOIN designer_rel ON designers.designer_id = designer_rel.designer_id " +
        "INNER JOIN releases ON releases.release_id = designer_rel.release_id " +
        "WHERE releases.game_id = '" +
        id +
        "'), " +
        "(SELECT DISTINCT string_agg(genres.name, ', ') AS Genres FROM genres " +
        "JOIN genre_rel ON genres.genre_id = genre_rel.genre_id " +
        "WHERE genre_rel.game_id = '" +
        id +
        "'), " +
        "releases.region AS Region, releases.first_release, releases.release_id " +
        "FROM releases " +
        "JOIN games ON games.game_id = releases.game_id " +
        "INNER JOIN consoles ON releases.console_id = consoles.console_id " +
        "INNER JOIN companies ON releases.publisher_id = companies.company_id " +
        "WHERE releases.game_id = '" +
        id +
        "' " +
        "GROUP BY releases.release_id, games.game_id, games.name, consoles.Console_id, " +
        "Console, releases.release_date, companies.company_id, " +
        "companies.name, releases.region, releases.first_release " +
        "ORDER BY releases.release_date;"
    );
    //var results = { results: result ? result.rows : null };
    var secondaryReleases = [];
    var game;
    for (var i = 0; i < result.rows.length; i++) {
      if (result.rows[i].first_release == "yes") {
        game = {
          game_id: result.rows[i].game_id,
          name: result.rows[i].name,
          console_id: result.rows[i].console_id,
          console: result.rows[i].console,
          release_date: result.rows[i].release_date,
          publisher_id: result.rows[i].publisher_id,
          publisher: result.rows[i].publisher,
          developers: result.rows[i].developers,
          designers: result.rows[i].designers,
          region: result.rows[i].region,
          genres: result.rows[i].genres,
        };
      } else {
        var secondaryRelease = {
          game_id: result.rows[i].game_id,
          name: result.rows[i].name,
          console_id: result.rows[i].console_id,
          console: result.rows[i].console,
          release_date: result.rows[i].release_date,
          publisher_id: result.rows[i].publisher_id,
          publisher: result.rows[i].publisher,
          developers: result.rows[i].developers,
          designers: result.rows[i].designers,
          region: result.rows[i].region,
          genres: result.rows[i].genres,
        };
        secondaryReleases.push(secondaryRelease);
      }
    }
    const result2 = await client.query(
      "SELECT users.user_name AS user_name, users.user_id AS user_id, ratings.user_rating AS user_rating, ratings.catalog AS catalog, " +
      "ratings.user_review AS user_review "+
      "FROM users JOIN ratings ON users.user_id = ratings.user_id " +
      "INNER JOIN releases ON releases.release_id = ratings.release_id " +
      "WHERE releases.game_id = " + id + ';' 
    );
    var userReviews = [];
    var game;
    var reviewed = false;
    for (var i = 0; i < result2.rows.length; i++) {
      if(loggedIn == true){
        if(result2.rows[i].user_id == user_id){
          reviewed = true;
          var userReview = {
            user_rating: result2.rows[i].user_rating,
            user_catalog: result2.rows[i].catalog,
            user_review: result2.rows[i].user_review,
          }
        }
      }
      var review = {
        user_id: result2.rows[i].user_id,
        user_name: result2.rows[i].user_name,
        user_rating: result2.rows[i].user_rating,
        user_review: result2.rows[i].user_review,
      }
      userReviews.push(review);
    }
    res.render("game", {
      game: game,
      secondaryReleases: secondaryReleases,
      userReview: userReview,
      userReviews: userReviews,
      user_name: user_name,
      loggedIn: loggedIn,
      user_id: user_id,
      reviewed: reviewed,
    });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/console/:console_id", async (req, res) => {
  res.status(200);
  var id = req.params.game_id;
  try {
    const client = await pool.connect();
    const result = await client.query(
      //"SELECT * FROM games;"
      "SELECT consoles.console_id AS Console_id, " +
        "consoles.name AS Console, " +
        "TO_CHAR(consoles.release_date,'MM/DD/YYYY') AS Release_date, " +
        "companies.company_id AS Manufacturer_id, companies.name AS Manufacturer, " +
        "consoles.region AS Region, generation.name " +
        "FROM consoles, companies " +
        "WHERE consoles.console_id = '" +
        id +
        "' AND consoles.manufacturer_id = companies.company_id;"
    );
    var console = {
      console_id: result.rows[i].console_id,
      console: result.rows[i].console,
      release_date: result.rows[i].release_date,
      manufacturer_id: result.rows[i].publisher_id,
      manufacturer: result.rows[i].publisher,
      region: result.rows[i].region,
    };
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

// create a chart given a query from the chart page
app.post("/gen", async (req, res) => {
  try {
    res.status(200);

    // construct a series of 'if' statements that will
    // determine the contents of the query, so that it makes sense
    // and produces the chart the user wants
    var yearParam1;
    var yearParam2;
    var genreParam;
    var consoleParam;
    var generationParam;
    var publisherParam;

    if(req.body.Publisher == "ANY") {
      publisherParam = "ANY(SELECT releases.publisher_id FROM releases)";
    } else {
      // consoleParam = req.body.Console.toString();
        publisherParam = "ANY(SELECT releases.publisher_id FROM releases, companies WHERE releases.publisher_id = companies.company_id AND companies.name = " +
        "'" +
        req.body.Publisher +
        "')";
    }

    if (!req.body.MinYear) {
      yearParam1 = "'1900-01-01'::date";
    } else {
      yearParam1 = "'" + req.body.MinYear + "-01-01" + "'::date";
    }

    if (!req.body.MaxYear) {
      yearParam2 = "'2999-01-01'::date";
    } else {
      yearParam2 = "'" + req.body.MaxYear + "-01-01" + "'::date";
    }

    if (req.body.Genre == "ANY") {
      genreParam = "ANY(SELECT genres.genre_id FROM genres)";
    } else {
      genreParam =
        "ANY(SELECT genre_id FROM genres WHERE name = " +
        "'" +
        req.body.Genre +
        "')";
    }

    if (req.body.Console == "ANY") {
      consoleParam = "ANY(SELECT releases.console_id FROM releases)";
    } else {
      // consoleParam = req.body.Console.toString();
      consoleParam =
        "ANY(SELECT console_id FROM consoles WHERE name = " +
        "'" +
        req.body.Console +
        "')";
    }

    if (req.body.Generation == "Any") {
      generationParam =
        "ANY(SELECT consoles.generation_id FROM consoles) OR consoles.generation_id IS NULL";
    } else {
      // generationParam = "SELECT generation_id FROM consoles WHERE generation_id = " + req.body.Generation;
      generationParam = req.body.Generation;
    }

    console.log(yearParam1);
    console.log(yearParam2);
    console.log(genreParam);
    console.log(generationParam);
    console.log(consoleParam);

    var query =
      "SELECT games.game_id, " +
      "games.name, consoles.console_id, consoles.name AS Console, companies.name AS Publisher, companies.company_id AS publisher_id, releases.region AS Region, string_agg(DISTINCT genres.name, ', ') AS Genres, rating.average FROM " +
      "(SELECT release_id, round( avg(user_rating)::numeric, 2) AS average " +
      "FROM ratings GROUP BY release_id) AS rating " +
      "JOIN releases ON releases.release_id = rating.release_id " +
      "INNER JOIN games ON releases.game_id = games.game_id " +
      "INNER JOIN consoles ON releases.console_id = consoles.console_id " +
      "INNER JOIN companies ON releases.publisher_id = companies.company_id " +
      "INNER JOIN genre_rel ON games.game_id = genre_rel.game_id " +
      "INNER JOIN genres ON genre_rel.genre_id = genres.genre_id " +
      "WHERE (releases.console_id = " +
      consoleParam +
      " " +
      "AND releases.publisher_id = " +
      publisherParam +
      " " +
      "AND genres.genre_id = " +
      genreParam +
      " " +
      "AND (consoles.generation_id = " +
      generationParam +
      ") " +
      "AND releases.release_date >= " +
      yearParam1 +
      " " +
      "AND releases.release_date < " +
      yearParam2 +
      " " +
      "AND releases.first_release = 'yes') " +
      "GROUP BY games.game_id, games.name, rating.average, Console, consoles.console_id, releases.release_date, companies.company_id, Publisher, releases.region " +
      "ORDER BY average DESC;"

    // touch postgres DB server
    const client = await pool.connect();

    // generate query
    // use temp query for now
    const result = await client.query(query);
    // const results = { results: result ? result.rows : null };
    console.log(result.rows);

    // console, publisher, genre data
    const select2 = await client.query("SELECT name FROM consoles;");
    // console.log(select2);

    var consoles = [];
    for (var i = 0; i < select2.rows.length; i++) {
      var console1 = {
        name: select2.rows[i].name,
      };
      consoles.push(console1);
    }
    // console.log(consoles);

    const select1 = await client.query(
      "SELECT DISTINCT name FROM companies, releases WHERE companies.company_id = releases.publisher_id;"
    );
    var publishers = [];
    for (var i = 0; i < select1.rows.length; i++) {
      var publisher = {
        name: select1.rows[i].name,
      };
      publishers.push(publisher);
    }
    // console.log(publishers);

    const select3 = await client.query("SELECT name FROM genres;");
    var genres = [];
    for (var i = 0; i < select3.rows.length; i++) {
      var genre = {
        name: select3.rows[i].name,
      };
      genres.push(genre);
    }
    // console.log(genres);

    var searchResults = [];
    //let data = result.rows;
    //for (let i = data.length - 1; i >= 0; i--) {
    for (var i = 0; i < result.rows.length; i++) {
      var rating = {
        game_id: result.rows[i].game_id,
        name: result.rows[i].name,
        //user_rating: data[i].avg,
        console_id: result.rows[i].console_id,
        console: result.rows[i].console,
        release_date: result.rows[i].release_date,
        publisher_id: result.rows[i].publisher_id,
        publisher: result.rows[i].publisher,
        region: result.rows[i].region,
        rating: result.rows[i].average,
        genres: result.rows[i].genres,
      };
      searchResults.push(rating);
    }
    res.render("gen", {
      reviewData: searchResults,
      publishers: publishers,
      consoles: consoles,
      genres: genres,
      user_name: user_name,
      user_id: user_id,
      loggedIn: loggedIn,
    });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

//add game in search results
app.get("/add", async (req, res) => {
  res.status(200);
  var series = [];
  var consoles = [];
  var genres = [];
  var designers = [];
  var generations = [];
  var companies = [];
  var countries = [];
  var regions = [];

  try {
    const client = await pool.connect();
    const query1 = await client.query("SELECT name FROM series;"); //query series
    const query2 = await client.query("SELECT name FROM Consoles;"); //query consoles
    const query3 = await client.query("SELECT name FROM genres;"); //query genres
    const query4 = await client.query("SELECT name FROM Designers;"); //query designers
    const query5 = await client.query("SELECT name FROM Companies;"); //query companies
    const query6 = await client.query("SELECT generation FROM Generations;"); //query companies

    for (let i = 0; i < query1.rows.length; i++) {
      series.push(query1.rows[i].name);
    }
    for (let i = 0; i < query2.rows.length; i++) {
      consoles.push(query2.rows[i].name);
    }
    for (let i = 0; i < query3.rows.length; i++) {
      genres.push(query3.rows[i].name);
    }
    for (let i = 0; i < query4.rows.length; i++) {
      designers.push(query4.rows[i].name);
    }
    for (let i = 0; i < query5.rows.length; i++) {
      companies.push(query5.rows[i].name);
    }
    for (let i = 0; i < query6.rows.length; i++) {
      generations.push(query6.rows[i].generation);
    }

    for (let i = 0; i < dataLength; i++) {
      countries.push(clone[i].name);
      regions.push(clone[i].region);
    }

    res.render("add", {
      loggedIn: loggedIn,
      "user_name": user_name,
      user_id: user_id,
      series: series,
      genres: genres,
      consoles: consoles,
      companies: companies,
      countries: countries,
      designers: designers,
      generations: generations,
    });

    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.listen(PORT, () => {
  console.log(
    "Server running at https://rateyourgames.heroku.com/ using port" + PORT
  );
});
