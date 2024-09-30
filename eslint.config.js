import grules from "grules";

export default [
  ...grules,
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
