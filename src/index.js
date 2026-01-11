"use strict";

const escapeRegExp = /["&'<=>]/g;
const escapeFunction = (string) => {
  if (!escapeRegExp.test(string)) {
    return string;
  }

  let escaped = "";
  let start = 0;

  do {
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
  } while (escapeRegExp.test(string));

  return escaped + string.slice(start);
};

/**
 * @param {TemplateStringsArray} literals literals
 * @param {...any} expressions expressions
 * @returns {string} string
 */
const html = (literals, ...expressions) => {
  let accumulator = "";
  const expressionsLength = expressions.length;

  for (let i = 0; i < expressionsLength; ++i) {
    let literal = literals.raw[i];
    let string =
      typeof expressions[i] === "string"
        ? expressions[i]
        : expressions[i] == null
          ? ""
          : Array.isArray(expressions[i])
            ? expressions[i].join("")
            : `${expressions[i]}`;

    if (literal.length && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (string.length) {
      string = escapeFunction(string);
    }

    accumulator += literal + string;
  }

  return accumulator + literals.raw[expressionsLength];
};

/**
 * @param {TemplateStringsArray} literals literals
 * @param {...any} expressions expressions
 * @yields {string} string
 * @returns {Generator<string, void, void>} Generator<string, void, void>
 */
const htmlGenerator = function* (literals, ...expressions) {
  const expressionsLength = expressions.length;

  for (let i = 0; i < expressionsLength; ++i) {
    let expression = expressions[i];
    let literal = literals.raw[i];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression == null) {
      string = "";
    } else {
      if (typeof expression[Symbol.iterator] === "function") {
        const isRaw =
          literal.length && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length) {
          yield literal;
        }

        for (expression of expression) {
          if (typeof expression === "string") {
            string = expression;
          } else {
            if (expression == null) {
              continue;
            }

            if (typeof expression[Symbol.iterator] === "function") {
              for (expression of expression) {
                if (expression == null) {
                  continue;
                }

                string = `${expression}`;

                if (string.length) {
                  if (!isRaw) {
                    string = escapeFunction(string);
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
              string = escapeFunction(string);
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
      string = escapeFunction(string);
    }

    if (literal.length || string.length) {
      yield literal + string;
    }
  }

  if (literals.raw[expressionsLength].length) {
    yield literals.raw[expressionsLength];
  }
};

/**
 * @param {TemplateStringsArray} literals literals
 * @param {...any} expressions expressions
 * @yields {string} string
 * @returns {AsyncGenerator<string, void, void>} AsyncGenerator<string, void, void>
 */
const htmlAsyncGenerator = async function* (literals, ...expressions) {
  const expressionsLength = expressions.length;

  for (let i = 0; i < expressionsLength; ++i) {
    let expression = await expressions[i];
    let literal = literals.raw[i];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression == null) {
      string = "";
    } else {
      if (
        typeof expression[Symbol.iterator] === "function" ||
        typeof expression[Symbol.asyncIterator] === "function"
      ) {
        const isRaw =
          literal.length && literal.charCodeAt(literal.length - 1) === 33;

        if (isRaw) {
          literal = literal.slice(0, -1);
        }

        if (literal.length) {
          yield literal;
        }

        for await (expression of expression) {
          if (typeof expression === "string") {
            string = expression;
          } else {
            if (expression == null) {
              continue;
            }

            if (
              typeof expression[Symbol.iterator] === "function" ||
              typeof expression[Symbol.asyncIterator] === "function"
            ) {
              for await (expression of expression) {
                if (expression == null) {
                  continue;
                }

                string = `${expression}`;

                if (string.length) {
                  if (!isRaw) {
                    string = escapeFunction(string);
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
              string = escapeFunction(string);
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
      string = escapeFunction(string);
    }

    if (literal.length || string.length) {
      yield literal + string;
    }
  }

  if (literals.raw[expressionsLength].length) {
    yield literals.raw[expressionsLength];
  }
};

module.exports.html = html;
module.exports.htmlGenerator = htmlGenerator;
module.exports.htmlAsyncGenerator = htmlAsyncGenerator;
