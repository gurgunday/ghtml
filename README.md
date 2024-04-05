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

The `htmlGenerator` function is a generator version of the `html` function. It allows for the generation of HTML fragments in a streaming manner, which can be particularly useful for large templates or when generating HTML on-the-fly.

### `includeFile`

Available for Node.js users, the `includeFile` function reads and outputs the content of a file, caching it in memory for future reuse.

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

### `htmlGenerator`

The `htmlGenerator` function can be used to yield HTML fragments sequentially. This is especially useful when working with streams or large data sets.

```js
import { htmlGenerator } from "ghtml";

const items = ["Item 1", "Item 2", "Item 3"];
const listGenerator = htmlGenerator`<ul>${items.map((item) => html`<li>${item}</li>`)}</ul>`;

for (let fragment of listGenerator) {
  console.log(fragment);
}
```

### Reading and Caching Files with `includeFile`

```js
import { includeFile } from "ghtml/includeFile.js";

const logo = includeFile("static/logo.svg");

console.log(logo);
// Output: content of "static/logo.svg"
```
