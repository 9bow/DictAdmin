const model = require("../../models");
const Sequelize = require("sequelize");
const posTable = require("../../config/pos.json");
const Op = Sequelize.Op;

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

// Get list
exports.getList = function(req, res) {
  var queryOption = {};
  var whereClause = {};

  // Build Where Clause
  if (req.query.filters && req.query.filters.length > 0) {
    req.query.filters.forEach(filterItem => {
      switch (filterItem.type) {
        case "like":
          whereClause[filterItem.field] = { [Op.like]: "%" + filterItem.value + "%" };
          break;
        case "=":
          whereClause[filterItem.field] = { [Op.eq]: filterItem.value };
          break;
        case ">=":
          whereClause[filterItem.field] = { [Op.gte]: filterItem.value };
          break;
        default:
          console.log("OTHER OPERATORS ARE NOT IMPLEMENTED YET");
      }
    });
  }

  queryOption = {
    attributes: ["id", "token", "pos", "tf"],
    order: [["token", "ASC"], ["pos", "ASC"]],
    where: whereClause,
    limit: req.query.size,
    offset: req.query.size * (req.query.page - 1),
    raw: true
  };

  model.Dict.findAll(queryOption).then(itemData => {
    model.Dict.count(queryOption).then(countTotal => {
      res.send({
        last_page: Math.ceil(countTotal / req.query.size),
        data: itemData
      });
    });
  });
};

// Update TF value for the given token ID
exports.updateTf = function(req, res) {
  model.Dict.update(
    {
      tf: req.body.tf
    },
    {
      where: { id: req.params.id }
    }
  ).then(result => {
    res.send(result);
  });
};
