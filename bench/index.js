/* eslint-disable no-unused-expressions */
import { html } from "../src/html.js";
import { Bench } from "tinybench";
import { writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";

const bench = new Bench({ time: 1000 });

// Simple rendering
bench.add("Simple rendering", () => {
  html`<div>Hello, world!</div>`;
});

// Escaping characters
bench.add("Escaping characters", () => {
  const title = 'Quote: "Innovation"';
  html`<div title="${title}">Hello, world!</div>`;
});

// Using variables
const username = "User";
bench.add("Using variables", () => {
  html`<p>${username}</p>`;
});

// Handling null and undefined
bench.add("Handling null and undefined", () => {
  const value = null;
  const undef = undefined;
  html`<p>${value} and ${undef}</p>`;
});

// Nested templates
bench.add("Nested templates", () => {
  const user = { id: 1, name: "John Doe" };
  html`<div>User: ${html`<span>${user.name}</span>`}</div>`;
});

// Arrays and iteration
const items = ["Item 1", "Item 2", "Item 3"];
bench.add("Arrays and iteration", () => {
  html`<ul>
    ${items.map((item) => {
      return html`<li>${item}</li>`;
    })}
  </ul>`;
});

// Complex expressions
bench.add("Complex expressions", () => {
  const loggedIn = true;
  html`<nav>
    ${loggedIn
      ? html`<a href="/logout">Logout</a>`
      : html`<a href="/login">Login</a>`}
  </nav>`;
});

// Large strings
const largeString = Array.from({ length: 1000 }).join("Lorem ipsum ");
bench.add("Large strings", () => {
  html`<p>${largeString}</p>`;
});

// High iteration count
bench.add("High iteration count", () => {
  for (let i = 0; i < 1000; i++) {
    html`<span>${i}</span>`;
  }
});

// Handling script tags without execution
bench.add("Script tags without execution", () => {
  const scriptContent =
    "<script>console.log('This should not execute');</script>";
  html`<div>${scriptContent}</div>`;
});

// Unescaped expressions with "!"
bench.add("Unescaped expressions", () => {
  const rawHTML = "<em>Italic</em> and <strong>bold</strong>";
  html`
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
  `;
});

// Escaping is avoided (demonstration with "!")
bench.add("Escaping avoided with !", () => {
  const markup = "<mark>Highlighted</mark>";
  html`<div>!${markup}</div>`;
});

await bench.warmup();
await bench.run();

const table = bench.table();
console.table(table);

writeFileSync(
  "bench/results.json",
  Buffer.from(JSON.stringify(table), "utf8").toString("base64"),
);
