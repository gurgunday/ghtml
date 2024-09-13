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
 * The `html` function is designed to tag template literals and automatically escape their expressions.
 * @param {TemplateStringsArray} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @returns {string} The processed HTML string.
 */
export const html = (literals, ...expressions) => {
  let accumulator = "";

  for (let i = 0; i !== expressions.length; ++i) {
    let literal = literals.raw[i];
    let string =
      typeof expressions[i] === "string"
        ? expressions[i]
        : expressions[i] == null
          ? ""
          : Array.isArray(expressions[i])
            ? expressions[i].join("")
            : `${expressions[i]}`;

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
 * The `htmlGenerator` function acts as the generator version of the `html` function.
 * @param {TemplateStringsArray} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields Processed HTML strings.
 * @returns {Generator<string, void, void>} The HTML generator.
 */
export const htmlGenerator = function* (literals, ...expressions) {
  for (let i = 0; i !== expressions.length; ++i) {
    let expression = expressions[i];
    let literal = literals.raw[i];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression == null) {
      string = "";
    } else {
      if (expression[Symbol.iterator]) {
        const isRaw =
          literal !== "" && literal.charCodeAt(literal.length - 1) === 33;

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
            if (expression == null) {
              continue;
            }

            if (expression[Symbol.iterator]) {
              for (expression of expression) {
                if (typeof expression === "string") {
                  string = expression;
                } else {
                  if (expression == null) {
                    continue;
                  }

                  string = `${expression}`;
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

            string = `${expression}`;
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

      string = `${expression}`;
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
 * This version of HTML generator should be preferred for asynchronous and streaming use cases.
 * @param {TemplateStringsArray} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields Processed HTML strings.
 * @returns {AsyncGenerator<string, void, void>} The HTML generator.
 */
export const htmlAsyncGenerator = async function* (literals, ...expressions) {
  for (let i = 0; i !== expressions.length; ++i) {
    let expression = await expressions[i];
    let literal = literals.raw[i];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression == null) {
      string = "";
    } else {
      if (expression[Symbol.iterator] || expression[Symbol.asyncIterator]) {
        const isRaw =
          literal !== "" && literal.charCodeAt(literal.length - 1) === 33;

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
            if (expression == null) {
              continue;
            }

            if (
              expression[Symbol.iterator] ||
              expression[Symbol.asyncIterator]
            ) {
              for await (expression of expression) {
                if (typeof expression === "string") {
                  string = expression;
                } else {
                  if (expression == null) {
                    continue;
                  }

                  string = `${expression}`;
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

            string = `${expression}`;
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

      string = `${expression}`;
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
