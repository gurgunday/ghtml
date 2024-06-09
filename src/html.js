const escapeDictionary = {
  '"': "&quot;",
  "'": "&apos;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

const escapeRegExp = new RegExp(
  `[${Object.keys(escapeDictionary).join("")}]`,
  "u",
);

const escapeFunction = (string) => {
  const stringLength = string.length;
  let start = 0;
  let end = 0;
  let escaped = "";

  do {
    const escapedCharacter = escapeDictionary[string[end++]];

    if (escapedCharacter) {
      escaped += string.slice(start, end - 1) + escapedCharacter;
      start = end;
    }
  } while (end !== stringLength);

  return escaped + string.slice(start, end);
};

const arrayIsArray = Array.isArray;

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @returns {string} The HTML string.
 */
const html = ({ raw: literals }, ...expressions) => {
  let index = 0;
  let accumulator = "";

  for (; index !== expressions.length; ++index) {
    const expression = expressions[index];
    let literal = literals[index];
    let string =
      expression === undefined || expression === null
        ? ""
        : typeof expression === "string"
          ? expression
          : arrayIsArray(expression)
            ? expression.join("")
            : `${expression}`;

    if (literal && literal.charCodeAt(literal.length - 1) === 33) {
      literal = literal.slice(0, -1);
    } else if (string && escapeRegExp.test(string)) {
      string = escapeFunction(string);
    }

    accumulator += literal + string;
  }

  return accumulator + literals[index];
};

/**
 * @param {{ raw: string[] }} literals Tagged template literals.
 * @param {...any} expressions Expressions to interpolate.
 * @yields {string} The HTML strings.
 */
const htmlGenerator = function* ({ raw: literals }, ...expressions) {
  let index = 0;

  for (; index !== expressions.length; ++index) {
    let expression = expressions[index];
    let literal = literals[index];
    let string;

    if (expression === undefined || expression === null) {
      string = "";
    } else if (typeof expression === "string") {
      string = expression;
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
  let index = 0;

  for (; index !== expressions.length; ++index) {
    let expression = await expressions[index];
    let literal = literals[index];
    let string;

    if (expression === undefined || expression === null) {
      string = "";
    } else if (typeof expression === "string") {
      string = expression;
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
