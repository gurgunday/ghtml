import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { win32, posix } from "node:path";
import { Glob } from "glob";

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
  includeDotFiles,
  skipPatterns,
) => {
  for (let ref of refs) {
    ref = ref.split(win32.sep).join(posix.sep);
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

    for await (const file of filesIterable) {
      let content = await readFile(file, "utf8");
      let found = false;

      for (const [originalPath, hash] of fileHashes) {
        const escapedPath = originalPath.replace(
          /[$()*+.?[\\\]^{|}]/gu,
          "\\$&",
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
        await writeFile(file, content);
      }
    }
  }
};

const generateHashesAndReplace = async ({
  roots,
  refs,
  includeDotFiles = false,
  skipPatterns = ["**/node_modules/**"],
}) => {
  const fileHashes = new Map();
  roots = Array.isArray(roots) ? roots : [roots];
  refs = Array.isArray(refs) ? refs : [refs];

  for (let rootPath of roots) {
    rootPath = rootPath.split(win32.sep).join(posix.sep);
    if (!rootPath.endsWith("/")) {
      rootPath += "/";
    }

    const queue = [];
    const files = [];
    const filesIterable = new Glob("**/**", {
      nodir: true,
      follow: true,
      absolute: true,
      cwd: rootPath,
      dot: includeDotFiles,
      ignore: skipPatterns,
    });

    for await (let filePath of filesIterable) {
      filePath = filePath.split(win32.sep).join(posix.sep);
      queue.push(generateFileHash(filePath));
      files.push(filePath);
    }

    const hashes = await Promise.all(queue);

    for (let i = 0; i < files.length; i++) {
      const fileRelativePath = posix.relative(rootPath, files[i]);
      fileHashes.set(fileRelativePath, hashes[i]);
    }
  }

  await updateFilePathsWithHashes(
    fileHashes,
    refs,
    includeDotFiles,
    skipPatterns,
  );
};

export { generateFileHash, generateHashesAndReplace };
