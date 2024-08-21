const escapeRegExp = /["&'<=>]/;

const escapeFunction = (string) => {
  let escaped = "";
  let start = 0;

  for (let end = 0; end !== string.length; ++end) {
    switch (string.charCodeAt(end)) {
      case 34: // "
        escaped += string.slice(start, end) + "&#34;";
        start = end + 1;
        continue;
      case 38: // &
        escaped += string.slice(start, end) + "&#38;";
        start = end + 1;
        continue;
      case 39: // '
        escaped += string.slice(start, end) + "&#39;";
        start = end + 1;
        continue;
      case 60: // <
        escaped += string.slice(start, end) + "&#60;";
        start = end + 1;
        continue;
      case 61: // =
        escaped += string.slice(start, end) + "&#61;";
        start = end + 1;
        continue;
      case 62: // >
        escaped += string.slice(start, end) + "&#62;";
        start = end + 1;
        continue;
    }
  }

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
    } else if (string && escapeRegExp.test(string)) {
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

                if (string) {
                  if (!isRaw && escapeRegExp.test(string)) {
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
            if (!isRaw && escapeRegExp.test(string)) {
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
    } else if (string && escapeRegExp.test(string)) {
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

                if (string) {
                  if (!isRaw && escapeRegExp.test(string)) {
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
            if (!isRaw && escapeRegExp.test(string)) {
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
    } else if (string && escapeRegExp.test(string)) {
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
