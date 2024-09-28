/* eslint-disable no-await-in-loop, require-unicode-regexp */

const escapeRegExp = /["&'<=>]/g;

const escapeFunction = (string) => {
  let escaped = "";
  let start = 0;

  while (escapeRegExp.test(string)) {
    const i = escapeRegExp.lastIndex - 1;

    switch (string.charCodeAt(i)) {
      case 34: // "
        escaped += string.slice(start, i) + "&#34;";
        break;
      case 38: // &
        escaped += string.slice(start, i) + "&#38;";
        break;
      case 39: // '
        escaped += string.slice(start, i) + "&#39;";
        break;
      case 60: // <
        escaped += string.slice(start, i) + "&#60;";
        break;
      case 61: // =
        escaped += string.slice(start, i) + "&#61;";
        break;
      case 62: // >
        escaped += string.slice(start, i) + "&#62;";
        break;
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
      : String(expressions[i] ?? "");

    if (literal && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else {
      string &&= escapeFunction(string);
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
      if (expression[Symbol.iterator]) {
        const isRaw =
          Boolean(literal) && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal) {
          yield literal;
        }

        for (expression of expression) {
          if (typeof expression === "string") {
            string = expression;
          } else {
            if (expression === undefined || expression === null) {
              continue;
            }

            if (expression[Symbol.iterator]) {
              for (expression of expression) {
                if (expression === undefined || expression === null) {
                  continue;
                }

                string = String(expression);

                if (string) {
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

          if (string) {
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

    if (literal && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else {
      string &&= escapeFunction(string);
    }

    if (literal || string) {
      yield literal + string;
    }
  }

  if (literals.raw[expressions.length]) {
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
      if (expression[Symbol.iterator] || expression[Symbol.asyncIterator]) {
        const isRaw =
          Boolean(literal) && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal) {
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
              expression[Symbol.iterator] ||
              expression[Symbol.asyncIterator]
            ) {
              for await (expression of expression) {
                if (expression === undefined || expression === null) {
                  continue;
                }

                string = String(expression);

                if (string) {
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

          if (string) {
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

    if (literal && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else {
      string &&= escapeFunction(string);
    }

    if (literal || string) {
      yield literal + string;
    }
  }

  if (literals.raw[expressions.length]) {
    yield literals.raw[expressions.length];
  }
};
