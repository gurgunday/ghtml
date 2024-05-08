/* eslint-disable no-unused-expressions */
import { html } from "../src/index.js";
import { Bench } from "tinybench";

const bench = new Bench({ time: 500 });

bench.add("Simple formatting", () => {
  html`<div>Hello, world!</div>`;
});

const username = "User";
bench.add("Using string variable", () => {
  html`<p>${username}</p>`;
});

const value = null;
const undef = undefined;
bench.add("Handling null and undefined", () => {
  html`<p>${value} and ${undef}</p>`;
});

const user = { id: 1, name: "John Doe" };
bench.add("Multiple types of expressions", () => {
  html`
    ${undefined}
    <div>User: <span>${user.name}</span></div>
    <div>Id: <span>${user.id}</span></div>
    ${null}
  `;
});

const items = ["Item 1", "Item 2", "Item 3"];
bench.add("Arrays and iteration", () => {
  html`<ul>
    ${items.map((item) => {
      return html`<li>${item}</li>`;
    })}
  </ul>`;
});

const items2 = ["Item 1", undefined, "Item 2", null, 2000];
bench.add("Arrays and iteration with multiple types", () => {
  html`<ul>
    ${items2.map((item) => {
      return html`<li>${item}</li>`;
    })}
  </ul>`;
});

const loggedIn = true;
bench.add("Complex/nested expressions", () => {
  html`<nav>
    ${loggedIn
      ? html`<a href="/logout">Logout</a>`
      : html`<a href="/login">Login</a>`}
  </nav>`;
});

const largeString = Array.from({ length: 1000 }).join("Lorem ipsum ");
bench.add("Large strings", () => {
  html`<p>${largeString}</p>`;
});

bench.add("High iteration count", () => {
  for (let i = 0; i !== 1000; i++) {
    html`<span>${i}</span>`;
  }
});

const scriptContent =
  "<script>console.log('This should not execute');</script>";
bench.add("Escape HTML", () => {
  html`<div>${scriptContent} ${scriptContent}</div>`;
});

// Render raw HTML
const rawHTML = "<em>Italic</em> and <strong>bold</strong>";
const markup = "<mark>Highlighted</mark>";
bench.add("Unescaped expressions", () => {
  html`
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
    <div>!${markup}</div>
    <div>!${markup}</div>
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
  `;
});

await bench.warmup();
await bench.run();

const table = bench.table();
console.table(table);
