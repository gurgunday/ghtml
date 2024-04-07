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
  let index = 0;

  while (index < expressions.length) {
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
    ++index;
  }

  return (accumulator += literals.raw[index]);
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlGenerator = function* (literals, ...expressions) {
  let index = 0;

  while (index < expressions.length) {
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

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length) {
          yield literal;
        }

        for (const value of expressions[index]) {
          expression =
            typeof value === "string"
              ? value
              : value == null
                ? ""
                : Array.isArray(value)
                  ? value.join("")
                  : `${value}`;

          if (expression.length) {
            if (!isRaw) {
              expression = expression.replace(escapeRegExp, escapeFunction);
            }

            yield expression;
          }
        }

        ++index;
        continue;
      }

      expression = `${expressions[index]}`;
    }

    if (literal.length && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (expression.length) {
      expression = expression.replace(escapeRegExp, escapeFunction);
    }

    if (literal.length || expression.length) {
      yield literal + expression;
    }

    ++index;
  }

  if (literals.raw[index].length) {
    yield literals.raw[index];
  }
};

export { html, htmlGenerator };
