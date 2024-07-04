const symbolIterator = Symbol.iterator;
const symbolAsyncIterator = Symbol.asyncIterator;

const escapeRegExp = /["&'<>`]/;
const escapeFunction = (string) => {
  const stringLength = string.length;
  let start = 0;
  let end = 0;
  let escaped = "";

  do {
    switch (string.charCodeAt(end++)) {
      case 34: // "
        escaped += string.slice(start, end - 1) + "&#34;";
        start = end;
        continue;
      case 38: // &
        escaped += string.slice(start, end - 1) + "&#38;";
        start = end;
        continue;
      case 39: // '
        escaped += string.slice(start, end - 1) + "&#39;";
        start = end;
        continue;
      case 60: // <
        escaped += string.slice(start, end - 1) + "&#60;";
        start = end;
        continue;
      case 62: // >
        escaped += string.slice(start, end - 1) + "&#62;";
        start = end;
        continue;
      case 96: // `
        escaped += string.slice(start, end - 1) + "&#96;";
        start = end;
        continue;
    }
  } while (end !== stringLength);

  escaped += string.slice(start, end);

  return escaped;
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @returns {string} The HTML string.
 */
const html = ({ raw: literals }, ...expressions) => {
  const expressionsLength = expressions.length;
  let index = 0;
  let accumulator = "";

  for (; index !== expressionsLength; ++index) {
    const expression = expressions[index];
    let literal = literals[index];
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

  accumulator += literals[index];

  return accumulator;
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlGenerator = function* ({ raw: literals }, ...expressions) {
  const expressionsLength = expressions.length;
  let index = 0;

  for (; index !== expressionsLength; ++index) {
    let expression = expressions[index];
    let literal = literals[index];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression == null) {
      string = "";
    } else {
      if (expression[symbolIterator]) {
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

            if (expression[symbolIterator]) {
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

  if (literals[index]) {
    yield literals[index];
  }
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlAsyncGenerator = async function* ({ raw: literals }, ...expressions) {
  const expressionsLength = expressions.length;
  let index = 0;

  for (; index !== expressionsLength; ++index) {
    let expression = await expressions[index];
    let literal = literals[index];
    let string;

    if (typeof expression === "string") {
      string = expression;
    } else if (expression == null) {
      string = "";
    } else {
      if (expression[symbolIterator] || expression[symbolAsyncIterator]) {
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

            if (expression[symbolIterator] || expression[symbolAsyncIterator]) {
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

  if (literals[index]) {
    yield literals[index];
  }
};

export { html, htmlGenerator, htmlAsyncGenerator };
