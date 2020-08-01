const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const path = require("path");
const port = 5000;

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(port, () => {
  console.log("server running at http://localhost:" + port);
});
