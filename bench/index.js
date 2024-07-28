/* eslint-disable no-unused-vars */
import { html } from "../src/index.js";
import { Bench } from "tinybench";
import { writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";

let result = "";
const bench = new Bench({ time: 500 });

bench.add("simple HTML formatting", () => {
  result = html`<div>Hello, world!</div>`;
});

bench.add("null and undefined expressions", () => {
  result = html`<p>${null} and ${undefined}</p>`;
});

const username = "User";
bench.add("single string expression", () => {
  result = html`<p>${username}</p>`;
});

bench.add("multiple string expressions", () => {
  result = html`<p>${username} and ${username}</p>`;
});

const items1 = ["Item 1", undefined, "Item 2", null, 2000, 1500.5];
bench.add("array expressions", () => {
  result = html`<ul>
    ${items1.map((item) => {
      return html`<li>${item}</li>`;
    })}
  </ul>`;
});

const items2 = ["Item 1", "Item <1.5>", "Item 2", "Item <2.5>", "Item 3"];
bench.add("array expressions with escapable chars", () => {
  result = html`<ul>
    ${items2.map((item) => {
      return html`<li>"${item}" & '${item}'</li>`;
    })}
  </ul>`;
});

const user = { id: 1, name: "John Doe" };
bench.add("object expressions", () => {
  result = html`
    <div>User: <span>${user.name}</span></div>
    <div>Id: <span>${user.id}</span></div>
  `;
});

bench.add("multiple types of expressions", () => {
  result = html`
    ${undefined}
    <div>User: <span>${user.name}</span></div>
    <div>Id: <span>${user.id}</span></div>
    ${null}${123}${456n}
    <ul>
      !${items2.map((item) => {
        return html`<li>${item}</li>`;
      })}
    </ul>
  `;
});

const largeString = Array.from({ length: 1000 }).join("Lorem ipsum ");
bench.add("large strings", () => {
  result = html`<p>${largeString}${largeString}</p>`;
});

const rawHTML = "<em>Italic</em> and <strong>bold</strong>";
const markup = "<mark>Highlighted</mark>";
bench.add("unescaped expressions", () => {
  result = html`
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
    <div>!${markup}</div>
    <div>!${markup}</div>
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
  `;
});

bench.add("escaped expressions", () => {
  result = html`
    <div>${rawHTML}</div>
    <div>${rawHTML}</div>
    <div>${markup}</div>
    <div>${markup}</div>
    <div>${rawHTML}</div>
    <div>${rawHTML}</div>
  `;
});

bench.add("mixed escaped and unescaped expressions", () => {
  result = html`
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
    <div>${markup}</div>
    <div>${markup}</div>
    <div>!${rawHTML}</div>
    <div>!${rawHTML}</div>
  `;
});

await bench.warmup();
await bench.run();

const table = bench.table();
console.table(table);

writeFileSync(
  "bench/results.json",
  Buffer.from(JSON.stringify(table), "utf8").toString("base64"),
);
