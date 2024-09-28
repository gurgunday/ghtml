import { readFileSync } from "node:fs";

const cache = new Map();

/**
 * @param {string} path path
 * @returns {string} string
 */
export const includeFile = (path) => {
  let file = cache.get(path);

  if (file === undefined) {
    file = readFileSync(path, "utf8");
    cache.set(path, file);
  }

  return file;
};
