const escapeRegExp = /["&'<=>]/g;

const escapeFunction = (string) => {
  let escaped = "";
  let start = 0;

  while (escapeRegExp.test(string)) {
    const i = escapeRegExp.lastIndex - 1;

    switch (string.charCodeAt(i)) {
      // "
      case 34: {
        escaped += string.slice(start, i) + "&#34;";
        break;
      }
      // &
      case 38: {
        escaped += string.slice(start, i) + "&#38;";
        break;
      }
      // '
      case 39: {
        escaped += string.slice(start, i) + "&#39;";
        break;
      }
      // <
      case 60: {
        escaped += string.slice(start, i) + "&#60;";
        break;
      }
      // =
      case 61: {
        escaped += string.slice(start, i) + "&#61;";
        break;
      }
      // >
      case 62: {
        escaped += string.slice(start, i) + "&#62;";
        break;
      }
    }

    start = escapeRegExp.lastIndex;
  }

  return escaped + string.slice(start);
};

/**
 * @param {TemplateStringsArray} literals literals
 * @param {...any} expressions expressions
 * @returns {string} string
 */
export const html = (literals, ...expressions) => {
  let accumulator = "";

  for (let i = 0; i !== expressions.length; ++i) {
    let literal = literals.raw[i];
    let string = Array.isArray(expressions[i])
      ? expressions[i].join("")
      : `${expressions[i] ?? ""}`;

    if (literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (string.length !== 0) {
      string = escapeFunction(string);
    }

    accumulator += literal + string;
  }

  return accumulator + literals.raw[expressions.length];
};

/**
 * @param {TemplateStringsArray} literals literals
 * @param {...any} expressions expressions
 * @yields {string} string
 * @returns {Generator<string, void, void>} Generator<string, void, void>
 */
export const htmlGenerator = function* (literals, ...expressions) {
  for (let i = 0; i !== expressions.length; ++i) {
    let expression = expressions[i];
    let literal = literals.raw[i];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression === undefined || expression === null) {
      string = "";
    } else {
      if (typeof expression[Symbol.iterator] === "function") {
        const isRaw =
          literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length !== 0) {
          yield literal;
        }

        for (expression of expression) {
          if (typeof expression === "string") {
            string = expression;
          } else {
            if (expression === undefined || expression === null) {
              continue;
            }

            if (typeof expression[Symbol.iterator] === "function") {
              for (expression of expression) {
                if (expression === undefined || expression === null) {
                  continue;
                }

                string = String(expression);

                if (string.length !== 0) {
                  if (!isRaw) {
                    string = escapeFunction(string);
                  }

                  yield string;
                }
              }

              continue;
            }

            string = String(expression);
          }

          if (string.length !== 0) {
            if (!isRaw) {
              string = escapeFunction(string);
            }

            yield string;
          }
        }

        continue;
      }

      string = String(expression);
    }

    if (literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (string.length !== 0) {
      string = escapeFunction(string);
    }

    if (literal.length !== 0 || string.length !== 0) {
      yield literal + string;
    }
  }

  if (literals.raw[expressions.length].length !== 0) {
    yield literals.raw[expressions.length];
  }
};

/**
 * @param {TemplateStringsArray} literals literals
 * @param {...any} expressions expressions
 * @yields {string} string
 * @returns {AsyncGenerator<string, void, void>} AsyncGenerator<string, void, void>
 */
export const htmlAsyncGenerator = async function* (literals, ...expressions) {
  for (let i = 0; i !== expressions.length; ++i) {
    let expression = await expressions[i];
    let literal = literals.raw[i];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression === undefined || expression === null) {
      string = "";
    } else {
      if (
        typeof expression[Symbol.iterator] === "function" ||
        typeof expression[Symbol.asyncIterator] === "function"
      ) {
        const isRaw =
          literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length !== 0) {
          yield literal;
        }

        for await (expression of expression) {
          if (typeof expression === "string") {
            string = expression;
          } else {
            if (expression === undefined || expression === null) {
              continue;
            }

            if (
              typeof expression[Symbol.iterator] === "function" ||
              typeof expression[Symbol.asyncIterator] === "function"
            ) {
              for await (expression of expression) {
                if (expression === undefined || expression === null) {
                  continue;
                }

                string = String(expression);

                if (string.length !== 0) {
                  if (!isRaw) {
                    string = escapeFunction(string);
                  }

                  yield string;
                }
              }

              continue;
            }

            string = String(expression);
          }

          if (string.length !== 0) {
            if (!isRaw) {
              string = escapeFunction(string);
            }

            yield string;
          }
        }

        continue;
      }

      string = String(expression);
    }

    if (literal.length !== 0 && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (string.length !== 0) {
      string = escapeFunction(string);
    }

    if (literal.length !== 0 || string.length !== 0) {
      yield literal + string;
    }
  }

  if (literals.raw[expressions.length].length !== 0) {
    yield literals.raw[expressions.length];
  }
};
