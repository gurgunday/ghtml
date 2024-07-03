#!/usr/bin/env node

import { generateHashesAndReplace } from "./utils.js";
import process from "node:process";

const parseArguments = (args) => {
  let roots = null;
  let refs = null;

  for (const arg of args) {
    if (arg.startsWith("--roots=")) {
      roots = arg.split("=", 2)[1].split(",");
    } else if (arg.startsWith("--refs=")) {
      refs = arg.split("=", 2)[1].split(",");
    }
  }

  if (!roots || !refs) {
    console.error(
      'Usage: npx hasset --roots="path/to/scan/assets1/,path/to/scan/assets2/" --refs="views/path/to/append/hashes1/,views/path/to/append/hashes2/"',
    );
    process.exit(1);
  }

  return { roots, refs };
};

const main = async () => {
  const { roots, refs } = parseArguments(process.argv.slice(2));

  try {
    console.warn(`Generating hashes and updating file paths...`);
    console.warn(`Scanning files in: ${roots}`);
    console.warn(`Updating files in: ${refs}`);

    await generateHashesAndReplace({
      roots,
      refs,
    });

    console.warn("Hash generation and file updates completed successfully.");
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
    process.exit(1);
  }
};

main();
