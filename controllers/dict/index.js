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
  console.log(typeof req.query.search.value);
  console.log(req.query.search.value);

  if (req.query.search.value === "") {
    whereClause = {};
  } else {
    whereClause = { token: { like: "%" + req.query.search.value + "%" } };
  }
  model.Dict.findAll({
    attributes: ["token", "pos", "tf"],
    where: whereClause,
    order: [["token", "ASC"], ["pos", "ASC"]],
    limit: req.query.length,
    offset: req.query.start,
    raw: true
  }).then(itemData => {
    model.Dict.count({}).then(countTotal => {
      // search keyword exists
      if (req.query.search.value !== "") {
        model.Dict.count({ where: whereClause }).then(countFiltered => {
          res.send({
            draw: req.query.draw,
            recordsTotal: countTotal,
            recordsFiltered: countFiltered,
            data: itemData
          });
        });
      }
      // search keyword does not exists
      else {
        res.send({
          draw: req.query.draw,
          recordsTotal: countTotal,
          recordsFiltered: countTotal,
          data: itemData
        });
      }
    });
  });
};
