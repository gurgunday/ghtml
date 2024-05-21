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
    let string =
      expressions[index] === undefined || expressions[index] === null
        ? ""
        : typeof expressions[index] === "string"
          ? expressions[index]
          : Array.isArray(expressions[index])
            ? expressions[index].join("")
            : `${expressions[index]}`;

    if (literal.length && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (string.length) {
      string = string.replace(escapeRegExp, escapeFunction);
    }

    accumulator += literal + string;
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
    let expression = expressions[index];
    let string;

    if (expression === undefined || expression === null) {
      string = "";
    } else if (typeof expression === "string") {
      string = expression;
    } else {
      if (expression[Symbol.iterator]) {
        const isRaw =
          literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length) {
          yield literal;
        }

        for (expression of expression) {
          if (expression === undefined || expression === null) {
            continue;
          }

          if (typeof expression === "string") {
            string = expression;
          } else {
            if (expression[Symbol.iterator]) {
              for (expression of expression) {
                if (expression === undefined || expression === null) {
                  continue;
                }

                string =
                  typeof expression === "string" ? expression : `${expression}`;

                if (string.length) {
                  if (!isRaw) {
                    string = string.replace(escapeRegExp, escapeFunction);
                  }

                  yield string;
                }
              }

              continue;
            }

            string = `${expression}`;
          }

          if (string.length) {
            if (!isRaw) {
              string = string.replace(escapeRegExp, escapeFunction);
            }

            yield string;
          }
        }

        continue;
      }

      string = `${expression}`;
    }

    if (literal.length && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (string.length) {
      string = string.replace(escapeRegExp, escapeFunction);
    }

    if (literal.length || string.length) {
      yield literal + string;
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

    expressions[index] = await expressions[index];

    if (expressions[index] === undefined || expressions[index] === null) {
      expression = "";
    } else if (typeof expressions[index] === "string") {
      expression = expressions[index];
    } else {
      if (
        expressions[index][Symbol.iterator] ||
        expressions[index][Symbol.asyncIterator]
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
          }

          if (typeof value === "string") {
            expression = value;
          } else {
            if (value[Symbol.iterator] || value[Symbol.asyncIterator]) {
              for await (const innerValue of value) {
                if (innerValue === undefined || innerValue === null) {
                  continue;
                }

                expression =
                  typeof innerValue === "string" ? innerValue : `${innerValue}`;

                if (expression.length) {
                  if (!isRaw) {
                    expression = expression.replace(
                      escapeRegExp,
                      escapeFunction,
                    );
                  }

                  yield expression;
                }
              }

              continue;
            }

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
