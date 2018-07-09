"use strict";

const lineReader = require("line-reader");

lineReader.eachLine("./dic.word", function(line, last) {
  var elements = line.split("\t");

  var token = elements[0];
  var attrs = elements.slice(1, elements.length);

  var result = [];

  attrs.forEach(attr => {
    attr = attr.split(":");
    var pos = attr[0];
    var tf = attr[1];

    // console.log(token, pos, tf);
    result.push({ token, pos, tf });
  });

  console.log(result);
});
