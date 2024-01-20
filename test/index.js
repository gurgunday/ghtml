import test from "node:test";
import assert from "node:assert";
import { html } from "../src/index.js";

const username = "Paul";
const descriptionSafe = "This is a safe description.";
const descriptionUnsafe =
  "<script>alert('This is an unsafe description.')</script>";
const array1 = [1, 2, 3, 4, 5];
const conditionTrue = true;
const conditionFalse = false;
const emptyString = "";

test("renders empty input", () => {
  assert.strictEqual(html({ raw: [] }), "");
});

test("renders empty input", () => {
  assert.strictEqual(html`${emptyString}`, "");
});

test("renders normal input", () => {
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
  // prettier-ignore
  assert.strictEqual(
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
    return "description of the object";
  };

  // prettier-ignore
  assert.strictEqual(
    html`
      <p>
        !${conditionTrue ? html`<strong> ${descriptionSafe} </strong>` : ""}
        !${conditionFalse
          ? ""
          :
            html`<em> ${array1.map((i) => {return i + 1;})} </em>`}<br />
        And also, ${false} ${null}${undefined}${obj} is ${true}
      </p>
    `,
    `
      <p>
        <strong> This is a safe description. </strong>
        <em> 23456 </em><br />
        And also, false description of the object is true
      </p>
    `,
  );
});
