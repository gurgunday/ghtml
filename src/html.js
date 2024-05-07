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
const html = ({ raw: literals }, ...expressions) => {
  let accumulator = "";
  let index = 0;

  for (; index !== expressions.length; ++index) {
    let literal = literals[index];
    let expression =
      expressions[index] === undefined || expressions[index] === null
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

  return (accumulator += literals[index]);
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlGenerator = function* ({ raw: literals }, ...expressions) {
  let index = 0;

  for (; index !== expressions.length; ++index) {
    let literal = literals[index];
    let expression;

    if (expressions[index] === undefined || expressions[index] === null) {
      expression = "";
    } else {
      if (typeof expressions[index][Symbol.iterator] === "function") {
        const isRaw =
          literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length) {
          yield literal;
        }

        for (const value of expressions[index]) {
          if (value === undefined || value === null) {
            continue;
          } else if (typeof value[Symbol.iterator] === "function") {
            expression = "";

            for (const innerValue of value) {
              expression += innerValue ?? "";
            }
          } else {
            expression = `${value}`;
          }

          if (expression.length) {
            if (!isRaw) {
              expression = expression.replace(escapeRegExp, escapeFunction);
            }

            yield expression;
          }
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

    if (literal.length || expression.length) {
      yield literal + expression;
    }
  }

  if (literals[index].length) {
    yield literals[index];
  }
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlAsyncGenerator = async function* ({ raw: literals }, ...expressions) {
  let index = 0;

  for (; index !== expressions.length; ++index) {
    let literal = literals[index];
    let expression;

    if (expressions[index] instanceof Promise) {
      expressions[index] = await expressions[index];
    }

    if (expressions[index] === undefined || expressions[index] === null) {
      expression = "";
    } else {
      if (
        typeof expressions[index][Symbol.iterator] === "function" ||
        typeof expressions[index][Symbol.asyncIterator] === "function"
      ) {
        const isRaw =
          literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length) {
          yield literal;
        }

        for await (const value of expressions[index]) {
          if (value === undefined || value === null) {
            continue;
          } else if (
            typeof value[Symbol.iterator] === "function" ||
            typeof value[Symbol.asyncIterator] === "function"
          ) {
            expression = "";

            for await (const innerValue of value) {
              expression += innerValue ?? "";
            }
          } else {
            expression = `${value}`;
          }

          if (expression.length) {
            if (!isRaw) {
              expression = expression.replace(escapeRegExp, escapeFunction);
            }

            yield expression;
          }
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

    if (literal.length || expression.length) {
      yield literal + expression;
    }
  }

  if (literals[index].length) {
    yield literals[index];
  }
};

export { html, htmlGenerator, htmlAsyncGenerator };
