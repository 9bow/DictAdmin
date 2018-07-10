var express = require("express");
var router = express.Router();

var dict = require("../controllers/dict");

router.get("/", function(req, res, next) {
  res.send("/dict");
});

// check given token/pos exists
router.get("/check/:token/:pos", dict.isExist);

router.get("/list", dict.getList);

module.exports = router;
