import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deserialize } from "../deserialize.ts";
import { Types, type SeriaValue } from "../types.ts";
import { ArrayIndex } from "../util.ts";

describe("deserializeArrayValue", () => {
  it("should deserialize empty array", () => {
    const value: SeriaValue = [Types.Array, []];
    const result = deserialize(value);
    assert.deepStrictEqual(result, []);
  });

  it("should deserialize array with primitive values", () => {
    const value: SeriaValue = [
      Types.Array,
      [
        [Types.String, "hello"],
        [Types.Number, 42],
        [Types.Boolean, true],
      ],
    ];
    const result = deserialize(value);
    assert.deepStrictEqual(result, ["hello", 42, true]);
  });

  it("should deserialize nested arrays", () => {
    const value: SeriaValue = [
      Types.Array,
      [
        [
          Types.Array,
          [
            [Types.Number, 1],
            [Types.Number, 2],
          ],
        ],
        [
          Types.Array,
          [
            [Types.String, "a"],
            [Types.String, "b"],
          ],
        ],
      ],
    ];
    const result = deserialize(value);
    assert.deepStrictEqual(result, [
      [1, 2],
      ["a", "b"],
    ]);
  });

  it("should handle references correctly", () => {
    const refs = new Map<string, any>();
    const ptr = "test";
    const value: SeriaValue = [
      Types.Array,
      [
        [Types.Number, 1],
        [Types.Number, 2],
      ],
    ];

    const result = deserialize(value, ptr, refs);
    assert.strictEqual(refs.get(ptr), result);
    assert.strictEqual(refs.get(`${ptr}/${ArrayIndex(0)}`), 1);
    assert.strictEqual(refs.get(`${ptr}/${ArrayIndex(1)}`), 2);
  });
});
