Replace your template engine with fast JavaScript by leveraging the power of [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).

Inspired by [html-template-tag](https://github.com/AntonioVdlC/html-template-tag).

## Installation

```shell
npm i ghtml
```

## API Reference

### `html`

The `html` function is used to tag template literals and escape their expressions. To bypass escaping an expression, prefix it with `!`.

### `htmlGenerator`

The `htmlGenerator` function is the generator version of the `html` function. It allows for the generation of HTML fragments in an iterative manner, which can be particularly useful for large templates or when generating HTML on-the-fly.

**Note:** It is important to note that, to be able to detect nested `htmlGenerator` usage, this function also checks if elements of an array expression are iterable as well and handles them accordingly. So an expression like `${[[1, 2, 3], 4]}` (note how the first element is an array itself) would be rendered as `"1,2,34"` with `html`, but as `"1234"` with `htmlGenerator`.

### `includeFile`

Available for Node.js users, the `includeFile` function is a wrapper around `readFileSync`. It reads and outputs the content of a file while also caching it in memory for faster future reuse.

## Usage

### `html`

```js
import { html } from "ghtml";

const username = '<img src="https://example.com/hacker.png">';
const greeting = html`<h1>Hello, ${username}!</h1>`;

console.log(greeting);
// Output: <h1>Hello, &lt;img src=&quot;https://example.com/hacker.png&quot;&gt;</h1>
```

To bypass escaping:

```js
const img = '<img src="https://example.com/safe.png">';
const container = html`<div>!${img}</div>`;

console.log(container);
// Output: <div><img src="https://example.com/safe.png"></div>
```

When nesting multiple `html` expressions, always use `!` as they will do their own escaping:

```js
const someCondition = Math.random() >= 0.5;
const data = {
  username: "John",
  age: 21,
};

const htmlString = html`
  <div>
    !${someCondition
      ? html`
          <p>Data:</p>
          <ul>
            !${Object.values(data).map(
              ([key, val]) => html`<li>${key}: ${val}</li>`,
            )}
          </ul>
        `
      : "<p>No data...</p>"}
  </div>
`;
```

### `htmlGenerator`

```js
import { htmlGenerator as html } from "ghtml";
import { Readable } from "node:stream";

const htmlContent = html`<html>
  <p>${"...your HTML content..."}</p>
</html>`;
const readableStream = Readable.from(htmlContent);

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  readableStream.pipe(res);
});
```

### `includeFile`

```js
import { includeFile } from "ghtml/includeFile.js";

const logo = includeFile("static/logo.svg");

console.log(logo);
// Output: content of "static/logo.svg"
```
