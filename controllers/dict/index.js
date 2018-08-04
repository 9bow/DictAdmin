const fs = require("fs");
const model = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const util = require("util");
const lineReader = require("line-reader");
const posTable = require("../../config/pos.json");

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

// Add Item
exports.addItem = function(req, res) {
  model.Dict.create({
    token: req.body.token,
    pos: req.body.pos,
    tf: req.body.tf * 1
  })
    .then(result => {
      if (
        result.dataValues.token === req.body.token &&
        result.dataValues.pos === req.body.pos &&
        result.dataValues.tf === req.body.tf * 1
      ) {
        res.send({ err: false, success: true, msg: "", data: result.dataValues });
      } else {
        res.send({ err: true, success: false, msg: "처리 중 오류가 발생하였습니다." });
      }
    })
    .catch(err => {
      if (err.name === "SequelizeUniqueConstraintError") {
        res.send({ err: true, success: false, msg: "해당 단어/품사는 이미 등록되어 있습니다." });
      } else {
        res.send({ err: true, success: false, msg: err.name });
      }
    });
};

// Export Dict Table to File
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
    res.status(500);
    res.send({ err: true, success: false, msg: err.name });
  }
};

// Import Dict Table from File
exports.ImportFromFile = function(req, res) {
  // Truncate Dict Table
  model.Dict.destroy({
    where: {},
    truncate: true
  }).then(() => {
    // Import from File
    var items = [];
    var dupCheck = {};
    var warnings = [];

    try {
      var eachLine = util.promisify(lineReader.eachLine);

      eachLine(req.file.path, function(line) {
        var elements = line.trim().split("\t");

        if (elements.length < 2) {
          warnings.push("다음 TAB으로 구분되지 않은 줄은 무시합니다. [" + line + "]");
          return;
        }

        var token = elements[0];
        var attrs = elements.slice(1, elements.length);

        attrs.forEach(attr => {
          var attr = attr.split(":");

          if (attr.length < 2) {
            warnings.push("다음은 [품사:빈도] 형태가 아니어서 무시합니다. 단어[" + token + "], [" + attr + "]");
            return;
          }

          var pos = attr[0];
          var tf = attr[1];

          if (!(pos in posTable)) {
            warnings.push("다음 단어 [" + token + "]의 [" + pos + "]는 존재하지 않는 품사로 무시합니다.");
            return;
          }

          if (token + pos in dupCheck) {
            warnings.push("다음 [" + token + ", " + pos + "]는 중복으로 빈도[" + tf + "]를 무시합니다.");
            return;
          }

          items.push({ token, pos, tf });
          dupCheck[token + pos] = tf;
        });
      }).then(() => {
        console.log("Read File DONE - Total " + items.length + " items, " + warnings.length + " warnings.");

        model.Dict.bulkCreate(items, { logging: false }).then(() => {
          console.log("Insert Items DONE");
          response = req.file;
          response.test = ["test1", "test2"];
          response.warnings = warnings;

          res.send(response);
        });
      });
    } catch (err) {
      res.status(500);
      res.send({ err: true, success: false, msg: err.name });
    }
  });
};
