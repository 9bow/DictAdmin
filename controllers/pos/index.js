const posTable = require("../../config/pos.json");

exports.getTable = function(req, res) {
  res.send(posTable);
};
