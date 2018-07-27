"use strict";

const util = require("util");
const lineReader = require("line-reader");
const model = require("../../models");
const posTable = require("../../config/pos.json");

exports.importDict = function(filename) {
  var items = [];
  var dupCheck = {};
  var warnings = [];

  try {
    var eachLine = util.promisify(lineReader.eachLine);

    eachLine(filename, function(line) {
      var elements = line.trim().split("\t");

      if (elements.length < 2) {
        warnings.push("다음 줄은 TAB으로 구분된 단어가 없어 무시합니다. [" + line + "]");
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
      console.log("read file - done w/ " + items.length + " items");
      console.log(warnings);
      model.Dict.bulkCreate(items, { logging: false }).then(() => {
        console.log("insert items - done");
      });
    });
  } catch (err) {
    throw err;
  }
};
