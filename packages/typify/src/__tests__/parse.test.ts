import assert from "node:assert/strict";
import test from "node:test";
import parser from "../parse/index.ts";

test("parser", async (t) => {
  await t.test("should return undefined for empty input", () => {
    assert.strictEqual(parser(undefined), undefined);
    assert.strictEqual(parser(""), undefined);
  });

  await t.test("should parse simple JSON string", () => {
    assert.deepStrictEqual(parser('{"foo": "bar"}'), { foo: "bar" });
  });
});
