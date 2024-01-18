import test from "node:test";
import assert from "node:assert";
import { html } from "../src/index.js";

const username = "G";
const descriptionSafe = "This is a safe description.";
const descriptionUnsafe =
  "<script>alert('This is an unsafe description.')</script>";
const array1 = [1, 2, 3, 4, 5];
const conditionTrue = true;
const conditionFalse = false;
const empty = "";

test("renders correctly", () => {
  assert.strictEqual(html({ raw: [] }, []), "");
});

test("renders correctly", () => {
  assert.strictEqual(html`${empty}`, "");
});

test("renders correctly", () => {
  assert.strictEqual(html`Hey, ${username}!`, `Hey, ${username}!`);
});

test("renders safe content", () => {
  assert.strictEqual(
    html`<p>${descriptionSafe}</p>`,
    "<p>This is a safe description.</p>",
  );
});

test("escapes unsafe output", () => {
  assert.strictEqual(
    html`<p>${descriptionUnsafe}</p>`,
    `<p>&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;</p>`,
  );
});

test("escapes unsafe output", () => {
  assert.strictEqual(
    html`<p>${descriptionUnsafe}</p>`,
    `<p>&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;</p>`,
  );
});

test("renders arrays", () => {
  assert.strictEqual(
    html`<p>${[descriptionSafe, descriptionUnsafe]}</p>`,
    "<p>This is a safe description.&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;</p>",
  );
});

test("bypass escaping", () => {
  assert.strictEqual(
    html`<p>!${[descriptionSafe, descriptionUnsafe]}</p>`,
    "<p>This is a safe description.<script>alert('This is an unsafe description.')</script></p>",
  );
});

test("renders wrapped html calls", () => {
  assert.strictEqual(
    // prettier-ignore
    html`<p>!${conditionTrue ? html`<strong>${descriptionUnsafe}</strong>` : ""}</p>`,
    "<p><strong>&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;</strong></p>",
  );
});

test("renders multiple html calls", () => {
  assert.strictEqual(
    html`
      <p>
        !${conditionFalse ? "" : html`<strong> ${descriptionSafe} </strong>`}
        <em> ${array1} </em>
        !${conditionFalse ? html`<em> ${array1} </em>` : ""}
      </p>
    `,
    // it should be formatted
    `
      <p>
        <strong> This is a safe description. </strong>
        <em> 12345 </em>
        
      </p>
    `,
  );
});

test("renders multiple html calls with different expression types", () => {
  const obj = {};
  obj.toString = () => {
    return "Description of the object.";
  };

  assert.strictEqual(
    html`
      <p>
        !${conditionTrue ? html`<strong> ${descriptionSafe} </strong>` : ""}
        !${conditionFalse
          ? ""
          : // prettier-ignore
            html`<em> ${array1.map((i) => {return i + 1;})} </em>`}<br />
        And also, ${false} ${null}${undefined}${obj}
      </p>
    `,
    // it should be formatted
    `
      <p>
        <strong> This is a safe description. </strong>
        <em> 23456 </em><br />
        And also, false Description of the object.
      </p>
    `,
  );
});
