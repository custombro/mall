import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const component = readFileSync(new URL("../app/display/DisplayClient.tsx", import.meta.url), "utf8");

test("inquiry fields remain editable when the standalone intake is offline", () => {
  assert.match(component, /<fieldset disabled=\{busy\} className=\{s\.formFields\}/);
  assert.match(component, /<a href=\{mailHref\}>작성 내용을 이메일로 문의하기/);
  assert.match(component, /const emailBody = \[/);
  assert.match(component, /const mailHref = `mailto:/);
});

test("offline intake never enables the submit button or claims server receipt", () => {
  assert.match(component, /if \(busy \|\| intakeReady !== true \|\| !formRef\.current\?\.reportValidity\(\)\) return;/);
  assert.match(component, /type="submit" disabled=\{busy \|\| intakeReady !== true\}/);
  assert.match(component, /if \(typeof data\.requestId !== "string"/);
});
