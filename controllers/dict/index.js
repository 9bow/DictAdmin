const model = require("../../models");
const Sequelize = require("sequelize");

exports.isExist = function(req, res) {
  var token = req.params.token;
  var pos = req.params.pos;

  model.Dict.findAndCountAll({
    where: {
      token: token,
      pos: pos
    }
  }).then(result => {
    if (result.count !== 0)
      res.send({
        result: true,
        rows: result.rows
      });
    else
      res.send({
        result: false,
        rows: []
      });
  });
};

exports.getList = function(req, res) {
  model.Dict.findAll({
    attributes: ["token", "pos", "tf"],
    where: {},
    order: [["token", "ASC"], ["pos", "ASC"]],
    limit: req.query.length,
    offset: req.query.start,
    raw: true
  }).then(itemData => {
    model.Dict.count({}).then(countData => {
      res.send({
        draw: req.query.draw,
        recordsTotal: countData,
        recordsFiltered: countData,
        data: itemData
      });
    });
  });
};
