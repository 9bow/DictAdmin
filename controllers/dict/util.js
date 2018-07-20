"use strict";

const util = require("util");
const lineReader = require("line-reader");
const model = require("../../models");

exports.importDict = function(filename) {
  var items = [];

  try {
    var eachLine = util.promisify(lineReader.eachLine);

    eachLine(filename, function(line) {
      var elements = line.split("\t");

      var token = elements[0];
      var attrs = elements.slice(1, elements.length);

      attrs.forEach(attr => {
        var attr = attr.split(":");
        var pos = attr[0];
        var tf = attr[1];

        items.push({ token, pos, tf });
      });
    }).then(() => {
      console.log("read file - done : " + items.length + " items");
      model.Dict.bulkCreate(items, { logging: false }).then(() => {
        console.log("insert items - done");
      });
    });
  } catch (err) {
    throw err;
  }
};
