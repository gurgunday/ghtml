const escapeDict = {
  '"': "&quot;",
  "'": "&apos;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

const escapeRE = new RegExp(`[${Object.keys(escapeDict).join("")}]`, "gu");

const escapeFn = (key) => {
  return escapeDict[key];
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
      string = string.replace(escapeRE, escapeFn);
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

                string = `${expression}`;

                if (string.length) {
                  if (!isRaw) {
                    string = string.replace(escapeRE, escapeFn);
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
              string = string.replace(escapeRE, escapeFn);
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
      string = string.replace(escapeRE, escapeFn);
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
    let expression = await expressions[index];
    let string;

    if (expression === undefined || expression === null) {
      string = "";
    } else if (typeof expression === "string") {
      string = expression;
    } else {
      if (expression[Symbol.iterator] || expression[Symbol.asyncIterator]) {
        const isRaw =
          literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length) {
          yield literal;
        }

        for await (expression of expression) {
          if (expression === undefined || expression === null) {
            continue;
          }

          if (typeof expression === "string") {
            string = expression;
          } else {
            if (
              expression[Symbol.iterator] ||
              expression[Symbol.asyncIterator]
            ) {
              for await (expression of expression) {
                if (expression === undefined || expression === null) {
                  continue;
                }

                string = `${expression}`;

                if (string.length) {
                  if (!isRaw) {
                    string = string.replace(escapeRE, escapeFn);
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
              string = string.replace(escapeRE, escapeFn);
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
      string = string.replace(escapeRE, escapeFn);
    }

    if (literal.length || string.length) {
      yield literal + string;
    }
  }

  if (literals[index].length) {
    yield literals[index];
  }
};

export { html, htmlGenerator, htmlAsyncGenerator };
