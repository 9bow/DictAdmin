"use strict";

const lineReader = require("line-reader");
const model = require("../../models");

exports.importDict = function(filename) {
  try {
    lineReader.eachLine(filename, function(line) {
      var elements = line.split("\t");

      var token = elements[0];
      var attrs = elements.slice(1, elements.length);

      var result = [];

      attrs.forEach(attr => {
        attr = attr.split(":");
        var pos = attr[0];
        var tf = attr[1];

        // result.push({ token, pos, tf });
        model.Dict.create({ token, pos, tf });
      });

      // return result;
    });
  } catch (err) {
    throw err;
  }
};
