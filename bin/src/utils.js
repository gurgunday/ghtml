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

    for await (const file of filesIterable) {
      let content = await readFile(file, "utf8");
      let hasChanges = false;

      for (const [originalPath, hash] of fileHashes) {
        const pathIndex = content.indexOf(originalPath);
        if (pathIndex !== -1) {
          hasChanges = true;
          const beforePath = content.slice(0, pathIndex);
          const afterPath = content.slice(pathIndex + originalPath.length);

          const queryStart = afterPath.indexOf("?");
          if (queryStart === -1) {
            content = `${beforePath}${originalPath}?hash=${hash}${afterPath}`;
            continue;
          }

          const queryEnd = afterPath.slice(queryStart).search(/[#"'`]/u);
          const queryString =
            queryEnd !== -1
              ? afterPath.slice(queryStart + 1, queryEnd)
              : afterPath.slice(queryStart + 1);

          const hashRegex = /(?<=(?:^|&))hash=[^&]*/u;
          if (hashRegex.test(queryString)) {
            const newQueryString = queryString.replace(
              hashRegex,
              `hash=${hash}`,
            );
            content = `${beforePath}${originalPath}?${newQueryString}${afterPath.slice(queryStart + queryString.length + 1)}`;
            continue;
          }

          content = `${beforePath}${originalPath}?hash=${hash}&${afterPath.slice(queryStart + 1)}`;
        }
      }

      if (hasChanges) {
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
    includeDotFiles,
    skipPatterns,
  );
};

export { generateFileHash, generateHashesAndReplace };
