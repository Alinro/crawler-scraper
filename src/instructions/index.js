"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructions = void 0;
var path_1 = require("path");
var url_1 = require("url");
var mapping = {
    oda: "./oda.json",
    finn: "./finn.json",
    test: "./test.json",
};
var getInstructions = function (name) {
    if (!mapping[name]) {
        throw "Instructions for ".concat(name, " not found");
    }
    var file = (0, url_1.fileURLToPath)(import.meta.url);
    var directory = (0, path_1.dirname)(file);
    var path = (0, path_1.join)(directory, mapping[name]);
    var fileContent = require(path);
    return JSON.parse(fileContent);
};
exports.getInstructions = getInstructions;
