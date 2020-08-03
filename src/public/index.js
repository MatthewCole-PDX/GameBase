//for the api
var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
  return res.status(200).json({ message: 'Welcome to Express API template' });
});
module.exports = router;
//end

var logIn = document.getElementById("logIn");
var chart = document.getElementById("chart");

//jump to logIn.html
logIn.onclick = function () {
  window.location.assign("logIn.html");
};

//jump to chart.html
chart.onclick = function () {
  window.location.assign("chart.html");
};
