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
 * @param {{ raw: string[] }} literals
 * @param {...any} expressions
 * @returns {string}
 */
const html = (literals, ...expressions) => {
  const lastLiteralIndex = literals.raw.length - 1;
  let accumulator = "";

  if (lastLiteralIndex === -1) {
    return accumulator;
  }

  for (let index = 0; index < lastLiteralIndex; ++index) {
    let literal = literals.raw[index];
    let expression =
      typeof expressions[index] === "string"
        ? expressions[index]
        : expressions[index] == null
          ? ""
          : Array.isArray(expressions[index])
            ? expressions[index].join("")
            : `${expressions[index]}`;

    if (literal.length && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (expression.length) {
      expression = expression.replace(escapeRegExp, escapeFunction);
    }

    accumulator += literal + expression;
  }

  accumulator += literals.raw[lastLiteralIndex];

  return accumulator;
};

export { html };
