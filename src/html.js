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

  accumulator += literals.raw[expressions.length];

  return accumulator;
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlGenerator = function* (literals, ...expressions) {
  for (let index = 0; index < expressions.length; ++index) {
    let literal = literals.raw[index];
    let expression;

    if (typeof expressions[index] === "string") {
      expression = expressions[index];
    } else if (expressions[index] == null) {
      expression = "";
    } else if (Array.isArray(expressions[index])) {
      expression = expressions[index].join("");
    } else {
      if (typeof expressions[index][Symbol.iterator] === "function") {
        const isRaw =
          literal.length > 0 && literal.charCodeAt(literal.length - 1) === 33;

        yield isRaw ? literal.slice(0, -1) : literal;

        for (const value of expressions[index]) {
          yield isRaw ? value : value.replace(escapeRegExp, escapeFunction);
        }

        continue;
      }

      expression = `${expressions[index]}`;
    }

    if (literal.length && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (expression.length) {
      expression = expression.replace(escapeRegExp, escapeFunction);
    }

    yield literal + expression;
  }

  yield literals.raw[expressions.length];
};

export { html, htmlGenerator };
