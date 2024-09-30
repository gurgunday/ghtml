#!/usr/bin/env node
import { generateHashesAndReplace } from "./utils.js";
import process from "node:process";

const parseArguments = (args) => {
  let roots = null;
  let refs = null;
  let prefix = "/";

  for (const arg of args) {
    if (arg.startsWith("--roots=")) {
      roots = arg.split("=", 2)[1].split(",");
    } else if (arg.startsWith("--refs=")) {
      refs = arg.split("=", 2)[1].split(",");
    } else if (arg.startsWith("--prefix=")) {
      prefix = arg.split("=", 2)[1];
    }
  }

  if (!roots || !refs) {
    globalThis.console.log(
      'Usage: npx ghtml --roots="base/path/to/scan/assets/1/,base/path/to/scan/assets/2/" --refs="views/path/to/append/hashes/1/,views/path/to/append/hashes/2/" [--prefix="/optional/prefix/"]',
    );
    process.exit(1);
  }

  return { roots, refs, prefix };
};

const main = async () => {
  const { roots, refs, prefix } = parseArguments(process.argv.slice(2));

  try {
    globalThis.console.log(`Generating hashes and updating file paths...`);
    globalThis.console.log(`Scanning files in: ${roots}`);
    globalThis.console.log(`Updating files in: ${refs}`);
    globalThis.console.log(`Using prefix: ${prefix}`);

    await generateHashesAndReplace({
      roots,
      refs,
      prefix,
    });

    globalThis.console.log(
      "Hash generation and file updates completed successfully.",
    );
  } catch (error) {
    globalThis.console.log(`Error occurred: ${error.message}`);
    process.exit(1);
  }
};

main();
