import grules from "grules";
import globals from "globals";

export default [
  ...grules,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "no-await-in-loop": "off",
      "require-unicode-regexp": "off",
    },
  },
  {
    ignores: ["bin/example/**/*.js"],
  },
];
