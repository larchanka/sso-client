const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require('cookie-parser');
const engine = require("ejs-mate");
const session = require("express-session");

const isAuthenticated = require("./isAuthenticated");
const checkSSORedirect = require("./checkSSORedirect");

app.use(
  session({
    secret: "key board cat",
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(morgan("dev"));
app.engine("ejs", engine);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(checkSSORedirect());

app.get("/", isAuthenticated, (req, res, next) => {
  const redirectURL = `${req.protocol}://${req.headers.host}${req.path}logout`;
  res.render("index", {
    what: `SSO-Consumer One ${JSON.stringify(req.session.user)}`,
    title: "SSO-Consumer | Home",
    logout_url: process.env.SSO_URL + '/.netlify/functions/index/sso/v1/logout?serviceURL=' + redirectURL,
  });
});

app.get("/logout", (req, res, next) => {
  res.render("logout", {
    title: "SSO-Consumer | Logout"
  });
});

app.use((req, res, next) => {
  // catch 404 and forward to error handler
  const err = new Error("Resource Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error({
    message: err.message,
    error: err
  });
  const statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (statusCode === 500) {
    message = "Internal Server Error";
  }
  res.status(statusCode).json({ message });
});

module.exports = app;
