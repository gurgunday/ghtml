const escapeRegExp = /["&'<=>`]/;

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
      case 96: // `
        escaped += string.slice(start, end) + "&#96;";
        start = end + 1;
        continue;
    }
  }

  escaped += string.slice(start);

  return escaped;
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @returns {string} The HTML string.
 */
const html = ({ raw: literals }, ...expressions) => {
  let accumulator = "";

  for (let i = 0; i !== expressions.length; ++i) {
    const expression = expressions[i];
    let literal = literals[i];
    let string =
      typeof expression === "string"
        ? expression
        : expression == null
          ? ""
          : Array.isArray(expression)
            ? expression.join("")
            : `${expression}`;

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
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlGenerator = function* ({ raw: literals }, ...expressions) {
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
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlAsyncGenerator = async function* ({ raw: literals }, ...expressions) {
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

export { html, htmlGenerator, htmlAsyncGenerator };
