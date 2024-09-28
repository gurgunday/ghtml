/* eslint-disable no-await-in-loop */

import { Glob } from "glob";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { win32, posix } from "node:path";

const generateFileHash = async (filePath) => {
  try {
    const fileBuffer = await readFile(filePath);
    return createHash("md5").update(fileBuffer).digest("hex").slice(0, 16);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    return "";
  }
};

const updateFilePathsWithHashes = async (
  fileHashes,
  refs,
  prefix,
  includeDotFiles,
  skipPatterns,
) => {
  for (let ref of refs) {
    ref = ref.replaceAll(win32.sep, posix.sep);
    if (!ref.endsWith("/")) {
      ref += "/";
    }

    const filesIterable = new Glob("**/**", {
      nodir: true,
      follow: true,
      absolute: true,
      cwd: ref,
      dot: includeDotFiles,
      ignore: skipPatterns,
    });

    for await (const filePath of filesIterable) {
      let content = await readFile(filePath, "utf8");
      let found = false;

      for (const [path, hash] of fileHashes) {
        const fullPath = prefix + path;
        const escapedPath = fullPath.replace(
          /[$()*+.?[\\\]^{|}]/gu,
          String.raw`\$&`,
        );
        const regex = new RegExp(
          `(?<path>${escapedPath})(\\?(?<queryString>[^#"'\`]*))?`,
          "gu",
        );

        content = content.replace(
          regex,
          (match, p1, p2, p3, offset, string, groups) => {
            found = true;
            const { path, queryString } = groups;

            return !queryString
              ? `${path}?hash=${hash}`
              : queryString.includes("hash=")
                ? `${path}?${queryString.replace(/(?<hash>hash=)[\dA-Fa-f]*/u, `$1${hash}`)}`
                : `${path}?hash=${hash}&${queryString}`;
          },
        );
      }

      if (found) {
        await writeFile(filePath, content);
      }
    }
  }
};

export const generateHashesAndReplace = async ({
  roots,
  refs,
  prefix,
  includeDotFiles = false,
  skipPatterns = ["**/node_modules/**"],
}) => {
  const fileHashes = new Map();
  roots = Array.isArray(roots) ? roots : [roots];
  refs = Array.isArray(refs) ? refs : [refs];

  for (let root of roots) {
    root = root.replaceAll(win32.sep, posix.sep);
    if (!root.endsWith("/")) {
      root += "/";
    }

    const queue = [];
    const files = [];
    const filesIterable = new Glob("**/**", {
      nodir: true,
      follow: true,
      absolute: true,
      cwd: root,
      dot: includeDotFiles,
      ignore: skipPatterns,
    });

    for await (let filePath of filesIterable) {
      filePath = filePath.replaceAll(win32.sep, posix.sep);
      queue.push(generateFileHash(filePath));
      files.push(filePath);
    }

    const hashes = await Promise.all(queue);

    for (let i = 0; i < files.length; ++i) {
      const fileRelativePath = posix.relative(root, files[i]);
      fileHashes.set(fileRelativePath, hashes[i]);
    }
  }

  await updateFilePathsWithHashes(
    fileHashes,
    refs,
    prefix,
    includeDotFiles,
    skipPatterns,
  );
};
