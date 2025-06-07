import assert from "node:assert/strict";
import test from "node:test";
import stringify from "../stringify.ts";

test("stringify", async (t) => {
  await t.test("primitives", () => {
    assert.equal(stringify(undefined), "undefined");
    assert.equal(stringify(null), "null");
    assert.equal(stringify(123), "123");
    assert.equal(stringify("hello"), '"hello"');
    assert.equal(stringify(true), "true");
    assert.equal(stringify(false), "false");
    assert.equal(stringify(BigInt(123)), "123n");
  });

  await t.test("arrays", () => {
    assert.equal(stringify([]), "[]");
    assert.equal(stringify([1, 2, 3]), "[1,2,3]");
    assert.equal(stringify(["a", "b"]), '["a","b"]');
    assert.equal(stringify([1, "a", true]), '[1,"a",true]');
  });

  await t.test("objects", () => {
    assert.equal(stringify({}), "{}");
    assert.equal(stringify({ a: 1 }), '{"a": 1}');
    assert.equal(stringify({ a: 1, b: "2" }), '{"a": 1,"b": "2"}');
  });

  await t.test("symbols", () => {
    assert.equal(stringify(Symbol("test")), `Symbol("test")`);
    assert.equal(stringify(Symbol.for("global")), 'SymbolFor("global")');
  });

  await t.test("String", () => {
    assert.equal(stringify(new String("test")), `String("test")`);
  });

  await t.test("sets", () => {
    assert.equal(stringify(new Set([1, 2, 3])), `Set([1,2,3])`);
  });

  await t.test("object with toJSON", () => {
    const obj = {
      toJSON() {
        return { converted: true };
      },
    };
    assert.equal(stringify(obj), '{"converted": true}');
  });

  await t.test("circular references", () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    assert.equal(stringify(obj), '{"a": 1,"self": Ref("#")}');
  });

  await t.test("nested structures", () => {
    const nested = {
      a: [1, 2, { b: 3 }],
      c: { d: [4, 5] },
    };
    assert.equal(stringify(nested), '{"a": [1,2,{"b": 3}],"c": {"d": [4,5]}}');
  });
});
