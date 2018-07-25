const fs = require("fs");
const model = require("../../models");
const Sequelize = require("sequelize");
const dictUtil = require("./util");
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
  var orderClause = [];

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

  // Build Order Clause
  if (req.query.sorters && req.query.sorters.length > 0) {
    req.query.sorters.forEach(sorterItem => {
      orderClause.push([sorterItem.field, sorterItem.dir]);
    });
  }

  // Build Query Options
  queryOption = {
    attributes: ["id", "token", "pos", "tf"],
    order: orderClause,
    where: whereClause,
    limit: req.query.size,
    offset: req.query.size * (req.query.page - 1),
    raw: true
  };

  // Query
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
  )
    .then(result => {
      if (result[0] === 1) {
        res.send({ err: false, msg: "", success: true });
      } else {
        res.send({ err: true, msg: "처리 중 오류가 발생하였습니다.", success: false });
      }
    })
    .catch(err => {
      res.send({ err: true, success: false, msg: err.name });
    });
};

// Update POS value for the given token ID
exports.updatePos = function(req, res) {
  model.Dict.update(
    {
      pos: req.body.pos
    },
    {
      where: { id: req.params.id }
    }
  )
    .then(result => {
      if (result[0] === 1) {
        res.send({ err: false, success: true, msg: "" });
      } else {
        res.send({ err: true, success: false, msg: "처리 중 오류가 발생하였습니다." });
      }
    })
    .catch(err => {
      if (err.name === "SequelizeUniqueConstraintError") {
        res.send({ err: true, success: false, msg: "해당 품사가 이미 존재합니다." });
      } else {
        res.send({ err: true, success: false, msg: err.name });
      }
    });
};

// Delete Item by the given token ID
exports.delItem = function(req, res) {
  model.Dict.destroy({
    where: { id: req.params.id }
  })
    .then(result => {
      if (result === 1) {
        res.send({ err: false, success: true, msg: "" });
      } else {
        res.send({ err: true, success: false, msg: "처리 중 오류가 발생하였습니다." });
      }
    })
    .catch(err => {
      res.send({ err: true, success: false, msg: err.name });
    });
};

exports.exportToFile = function(req, res) {
  try {
    var tmpFilename = "./tmpDict.word";
    var file = fs.createWriteStream(tmpFilename);

    file.on("error", function(err) {
      throw err;
    });

    var queryString = `SELECT \
        token || '\t' || GROUP_CONCAT(pos || ':' ||  tf, '\t') AS item \
      FROM \
        DICTS \
      GROUP BY \
        token \
      ORDER BY \
        token`;

    model.sequelize.query(queryString, { type: model.sequelize.QueryTypes.SELECT }).then(result => {
      result.forEach(function(data) {
        file.write(data.item + "\n");
      });
      file.end();
      file.on("finish", function() {
        res.download(tmpFilename, "dic.word");
      });
    });
  } catch (err) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(500);
    res.render("error");
  }
};
