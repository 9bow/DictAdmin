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
const fs = require("fs");
const multer = require("multer");
const model = require("./models");

// ROUTEs
var indexRouter = require("./routes/index");
var dictRouter = require("./routes/dict");
var posRouter = require("./routes/pos");

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

app.use(multer({ dest: "temp/" }).single("userDict"));
if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

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

////////////////////////////////////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////////////////////////////////////

app.use("/", indexRouter);
app.use("/dict", dictRouter);
app.use("/pos", posRouter);

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
