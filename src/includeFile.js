import { readFileSync } from "node:fs";

const cache = new Map();

/**
 * @param {string} path The path to the file to render.
 * @returns {string} The cached content of the file.
 */
const includeFile = (path) => {
  let file = cache.get(path);

  if (file === undefined) {
    file = readFileSync(path, "utf8");
    cache.set(path, file);
  }

  return file;
};

export { includeFile };
