const escapeRegExp = /["&'<=>]/g;

const escapeFunction = (string) => {
  if (!string || !escapeRegExp.test(string)) {
    return string;
  }

  let escaped = "";
  let start = 0;

  do {
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

    start = i + 1;
  } while (escapeRegExp.test(string));

  escaped += string.slice(start);

  return escaped;
};

/**
 * @param {TemplateStringsArray} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @returns {string} The processed HTML string.
 */
export const html = ({ raw: literals }, ...expressions) => {
  let accumulator = "";

  for (let i = 0; i !== expressions.length; ++i) {
    let literal = literals[i];
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
      string = escapeFunction(string);
    }

    accumulator += literal + string;
  }

  accumulator += literals[expressions.length];

  return accumulator;
};

/**
 * @param {TemplateStringsArray} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields Processed HTML strings.
 * @returns {Generator<string, void, void>} The HTML generator.
 */
export const htmlGenerator = function* ({ raw: literals }, ...expressions) {
  for (let i = 0; i !== expressions.length; ++i) {
    let expression = expressions[i];
    let literal = literals[i];
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

                if (!isRaw) {
                  string = escapeFunction(string);
                }

                if (string) {
                  yield string;
                }
              }

              continue;
            }

            string = `${expression}`;
          }

          if (!isRaw) {
            string = escapeFunction(string);
          }

          if (string) {
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
      string = escapeFunction(string);
    }

    if (literal || string) {
      yield literal + string;
    }
  }

  if (literals[expressions.length]) {
    yield literals[expressions.length];
  }
};

/**
 * @param {TemplateStringsArray} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields Processed HTML strings.
 * @returns {AsyncGenerator<string, void, void>} The HTML generator.
 */
export const htmlAsyncGenerator = async function* (
  { raw: literals },
  ...expressions
) {
  for (let i = 0; i !== expressions.length; ++i) {
    let expression = await expressions[i];
    let literal = literals[i];
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

                if (!isRaw) {
                  string = escapeFunction(string);
                }

                if (string) {
                  yield string;
                }
              }

              continue;
            }

            string = `${expression}`;
          }

          if (!isRaw) {
            string = escapeFunction(string);
          }

          if (string) {
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
      string = escapeFunction(string);
    }

    if (literal || string) {
      yield literal + string;
    }
  }

  if (literals[expressions.length]) {
    yield literals[expressions.length];
  }
};
