import assert from "node:assert/strict";
import { test } from "node:test";
import { serialize } from "../serialize.ts";
import { Types } from "../types.ts";

test("serialize", async (t) => {
  await t.test("serializes primitive types", () => {
    assert.deepEqual(serialize(undefined), [Types.Undefined]);
    assert.deepEqual(serialize(null), [Types.Null]);
    assert.deepEqual(serialize(true), [Types.Boolean, true]);
    assert.deepEqual(serialize(42), [Types.Number, 42]);
    assert.deepEqual(serialize("hello"), [Types.String, "hello"]);
    assert.deepEqual(serialize(BigInt(123)), [Types.BigInt, "123"]);
  });

  await t.test("serializes special numbers", () => {
    assert.deepEqual(serialize(NaN), [Types.Number, "NaN"]);
    assert.deepEqual(serialize(Infinity), [Types.Number, "Infinity"]);
    assert.deepEqual(serialize(-Infinity), [Types.Number, "-Infinity"]);
  });

  await t.test("serializes arrays", () => {
    assert.deepEqual(serialize([1, 2, 3]), [
      Types.Array,
      [
        [Types.Number, 1],
        [Types.Number, 2],
        [Types.Number, 3],
      ],
    ]);
  });

  await t.test("serializes objects", () => {
    const obj = { a: 1, b: "two" };
    assert.deepEqual(serialize(obj), [
      Types.Object,
      [
        [
          [Types.String, "a"],
          [Types.Number, 1],
        ],
        [
          [Types.String, "b"],
          [Types.String, "two"],
        ],
      ],
    ]);
  });

  await t.test("serializes Map", () => {
    const map = new Map([["key", "value"]]);
    assert.deepEqual(serialize(map), [
      Types.Map,
      [
        [
          [Types.String, "key"],
          [Types.String, "value"],
        ],
      ],
    ]);
  });

  await t.test("serializes Set", () => {
    const set = new Set([1, 2, 3]);
    assert.deepEqual(serialize(set), [
      Types.Set,
      [
        [Types.Number, 1],
        [Types.Number, 2],
        [Types.Number, 3],
      ],
    ]);
  });

  await t.test("serializes Date", () => {
    const date = new Date("2023-01-01");
    assert.deepEqual(serialize(date), [Types.Date, "2023-01-01T00:00:00.000Z"]);
  });

  await t.test("serializes RegExp", () => {
    const regex = /test/gi;
    assert.deepEqual(serialize(regex), [
      Types.RegExp,
      {
        source: "test",
        flags: "gi",
      },
    ]);
  });

  await t.test("serializes URL", () => {
    const url = new URL("https://example.com");
    assert.deepEqual(serialize(url), [Types.URL, "https://example.com/"]);
  });

  await t.test("serializes Error", () => {
    const error = new Error("test error");
    const result = serialize(error) as [
      string,
      {
        name: string;
        message: string;
        stack?: string;
        props: any[];
      },
    ];

    assert.equal(result[0], Types.Error);
    assert.equal(result[1].name, "Error");
    assert.equal(result[1].message, "test error");
    assert.ok(result[1].stack);
  });

  await t.test("handles circular references", () => {
    const obj: any = { a: 1 };
    obj.self = obj;

    const result = serialize(obj);
    assert.equal(result![0], Types.Object);
    assert.deepEqual(result![1][0], [
      [Types.String, "a"],
      [Types.Number, 1],
    ]);
    assert.equal(result![1]![1]![1]![0], Types.ReferenceType);
  });
});
