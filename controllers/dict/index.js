const model = require("../../models");

exports.isExist = function(req, res) {
  var token = req.params.token;
  var pos = req.params.pos;

  model.Dict.findAndCountAll({
    where: {
      token: token,
      pos: pos
    }
  }).then(result => {
    res.send(result);
  });
};
