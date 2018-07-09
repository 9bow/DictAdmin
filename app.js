////////////////////////////////////////////////////////////////////////////////
// Import
////////////////////////////////////////////////////////////////////////////////

// LIBs for Express
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var app = express();
const model = require("./models");

// ROUTEs
var indexRouter = require("./routes/index");

////////////////////////////////////////////////////////////////////////////////
// Express Settings
////////////////////////////////////////////////////////////////////////////////

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////

// Truncate All Tables
Object.keys(model).forEach(modelName => {
  if (modelName.toLowerCase() !== "sequelize")
    model[modelName].destroy({
      where: {},
      truncate: true
    });
});

const lineReader = require("line-reader");

lineReader.eachLine("./dic.word", function(line, last) {
  var elements = line.split("\t");

  var token = elements[0];
  var attrs = elements.slice(1, elements.length);

  var result = [];

  attrs.forEach(attr => {
    attr = attr.split(":");
    var pos = attr[0];
    var tf = attr[1];

    // console.log(token, pos, tf);
    model.Dict.create({ token, pos, tf });
  });
});

////////////////////////////////////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////////////////////////////////////

app.use("/", indexRouter);
// app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
