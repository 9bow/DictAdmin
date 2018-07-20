var express = require("express");
var router = express.Router();
var pos = require("../controllers/pos");

router.get("/", pos.getTable);

module.exports = router;
