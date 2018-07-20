var express = require("express");
var router = express.Router();

var dict = require("../controllers/dict");

router.get("/check/:token/:pos", dict.isExist);
router.get("/list", dict.getList);
router.post("/:id/tf", dict.updateTf);

module.exports = router;
