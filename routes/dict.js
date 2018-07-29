var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "temp/");
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

var dict = require("../controllers/dict");

router.get("/check/:token/:pos", dict.isExist);
router.get("/list", dict.getList);
router.put("/:id/tf", dict.updateTf);
router.put("/:id/pos", dict.updatePos);
router.delete("/:id", dict.delItem);
router.get("/download", dict.exportToFile);
router.post("/upload", dict.ImportFromFile);

module.exports = router;
