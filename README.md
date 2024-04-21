Replace your template engine with fast JavaScript by leveraging the power of [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).

Inspired by [html-template-tag](https://github.com/AntonioVdlC/html-template-tag).

## Installation

```shell
npm i ghtml
```

## API Reference

### `html`

The `html` function is designed to tag template literals and automatically escape their expressions to prevent XSS attacks. To intentionally bypass escaping for a specific expression, prefix it with `!`.

### `htmlGenerator`

The `htmlGenerator` function acts as the generator version of the `html` function. It facilitates the creation of HTML fragments iteratively, making it ideal for parsing large templates or constructing HTML content dynamically.

**Note:**

A key difference of `htmlGenerator` is its ability to recognize and properly handle iterable elements within array expressions. This is to detect nested `htmlGenerator` usage, enabling scenarios such as ``${[1, 2, 3].map(i => htmlGenerator`<li>${i}</li>`)}``.

As a side effect, an expression like `${[[1, 2, 3], 4]}` (where an element is an array itself) will not be rendered as `"1,2,34"`, which is the case with `html`, but as `"1234"`. This is the intended behavior most of the time anyway.

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
import http from "node:http";

http
  .createServer((req, res) => {
    const htmlContent = html`<html>
      <p>${"...HTML content..."}</p>
    </html>`;
    const readableStream = Readable.from(htmlContent);
    res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
    readableStream.pipe(res);
  })
  .listen(3000);
```

### `includeFile`

```js
import { includeFile } from "ghtml/includeFile.js";

const logo = includeFile("static/logo.svg");

console.log(logo);
// Output: content of "static/logo.svg"
```
