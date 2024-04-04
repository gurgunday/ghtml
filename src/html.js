const escapeDictionary = {
  '"': "&quot;",
  "'": "&apos;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

const escapeRegExp = new RegExp(
  `[${Object.keys(escapeDictionary).join("")}]`,
  "gu",
);

const escapeFunction = (key) => {
  return escapeDictionary[key];
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @returns {string} The HTML string.
 */
const html = (literals, ...expressions) => {
  let accumulator = "";

  for (let index = 0; index < expressions.length; ++index) {
    const expression =
      typeof expressions[index] === "string"
        ? expressions[index]
        : expressions[index] == null
          ? ""
          : Array.isArray(expressions[index])
            ? expressions[index].join("")
            : `${expressions[index]}`;

    if (
      literals.raw[index].length &&
      literals.raw[index].charCodeAt(literals.raw[index].length - 1) === 33
    ) {
      accumulator += literals.raw[index].slice(0, -1) + expression;
      continue;
    }

    accumulator +=
      literals.raw[index] + expression.replace(escapeRegExp, escapeFunction);
  }

  accumulator += literals.raw[expressions.length];

  return accumulator;
};

export { html };
