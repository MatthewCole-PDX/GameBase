var chart = document.getElementById("chart");
var home = document.getElementById("home");
var toSignUp = document.getElementById("signupButton");
var toLogin = document.getElementById("formButton");

//jump to chart.html
chart.onclick = function () {
  window.location.assign("chart.html");
};

//jump to index.html
home.onclick = function () {
  window.location.assign("index.html");
};

toSignUp.onclick = () => {
  window.location.assign("form.html");
};

toLogin.onclick = () => {
  window.location.assign("logIn.html");
};
