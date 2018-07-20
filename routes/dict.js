var express = require("express");
var router = express.Router();

var dict = require("../controllers/dict");

router.get("/check/:token/:pos", dict.isExist);
router.get("/list", dict.getList);
router.put("/:id/tf", dict.updateTf);
router.put("/:id/pos", dict.updatePos);
router.delete("/:id", dict.delItem);
router.get("/download", dict.exportToFile);

module.exports = router;
