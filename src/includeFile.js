"use strict";

const { readFileSync } = require("node:fs");

const cache = new Map();

/**
 * @param {string} path path
 * @returns {string} string
 */
const includeFile = (path) => {
  let file = cache.get(path);

  if (file === undefined) {
    file = readFileSync(path, "utf8");
    cache.set(path, file);
  }

  return file;
};

module.exports.includeFile = includeFile;
