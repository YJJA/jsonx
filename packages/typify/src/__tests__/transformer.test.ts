import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JSONX } from "@jsox/utils";
import {
  NodeKind,
  type ObjectExpressionNode,
  type CallExpressionNode,
} from "../parse/parser.ts";
import { transformer } from "../parse/transformer.ts";

describe("transformer", async () => {
  it("should transform primitive literals", () => {
    assert.strictEqual(
      transformer({ type: NodeKind.UndefinedLiteral, value: undefined }),
      undefined,
    );
    assert.strictEqual(
      transformer({ type: NodeKind.NullLiteral, value: null }),
      null,
    );
    assert.strictEqual(
      transformer({ type: NodeKind.BooleanLiteral, value: true }),
      true,
    );
    assert.strictEqual(
      transformer({ type: NodeKind.NumberLiteral, value: 123 }),
      123,
    );
    assert.strictEqual(
      transformer({ type: NodeKind.StringLiteral, value: "test" }),
      "test",
    );
    assert.strictEqual(
      transformer({ type: NodeKind.BigIntLiteral, value: BigInt(123) }),
      BigInt(123),
    );
  });

  it("should transform array expressions", () => {
    const arrayNode = {
      type: NodeKind.ArrayExpression,
      elements: [
        { type: NodeKind.NumberLiteral, value: 1 },
        { type: NodeKind.StringLiteral, value: "two" },
      ],
    };
    assert.deepStrictEqual(transformer(arrayNode), [1, "two"]);
  });

  it("should transform object expressions", () => {
    const objectNode: ObjectExpressionNode = {
      type: NodeKind.ObjectExpression,
      properties: [
        {
          type: NodeKind.ObjectProperty,
          key: { type: NodeKind.Identifier, value: "foo" },
          value: { type: NodeKind.StringLiteral, value: "bar" },
        },
      ],
    };
    assert.deepStrictEqual(transformer(objectNode), { foo: "bar" });
  });

  it("should handle Symbol call expressions", () => {
    const symbolNode: CallExpressionNode = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Symbol" },
      arguments: [{ type: NodeKind.StringLiteral, value: "test" }],
    };
    const result = transformer<any>(symbolNode);
    console.log(result);
    assert.strictEqual(typeof result, "symbol");
    assert.strictEqual(result.description, "test");
  });

  it("should throw on unknown node types", () => {
    assert.throws(() => transformer({ type: "UnknownType" as any } as any), {
      message: "Unknown Node: UnknownType",
    });
  });

  it("should handle refs between nodes", () => {
    const refs = new Map();
    const refNode: CallExpressionNode = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Ref" },
      arguments: [{ type: NodeKind.StringLiteral, value: "#" }],
    };
    const value = { test: "value" };
    refs.set("#", value);
    assert.strictEqual(transformer(refNode, "#", refs), value);
  });

  it("should transform program nodes", () => {
    const programNode = {
      type: NodeKind.Program,
      body: [{ type: NodeKind.StringLiteral, value: "test" }],
    };
    assert.strictEqual(transformer(programNode), "test");

    const emptyProgram = {
      type: NodeKind.Program,
      body: [],
    };
    assert.strictEqual(transformer(emptyProgram), undefined);
  });

  it("should transform computed object property keys", () => {
    const objectNode: ObjectExpressionNode = {
      type: NodeKind.ObjectExpression,
      properties: [
        {
          type: NodeKind.ObjectProperty,
          key: { type: NodeKind.Identifier, value: "computed" },
          value: { type: NodeKind.NumberLiteral, value: 123 },
        },
      ],
    };
    assert.deepStrictEqual(transformer(objectNode), { computed: 123 });
  });

  it("should throw on invalid object keys", () => {
    const objectNode = {
      type: NodeKind.ObjectExpression,
      properties: [
        {
          type: NodeKind.ObjectProperty,
          key: { type: NodeKind.BooleanLiteral, value: true },
          value: { type: NodeKind.NumberLiteral, value: 123 },
        },
      ],
    };
    assert.throws(() => transformer(objectNode as any), {
      message: "Object keys must be string, number or symbol, got boolean",
    });
  });

  it("should handle SymbolFor call expressions", () => {
    const symbolForNode: CallExpressionNode = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "SymbolFor" },
      arguments: [{ type: NodeKind.StringLiteral, value: "test" }],
    };
    const result = transformer<symbol>(symbolForNode);
    assert.strictEqual(result, Symbol.for("test"));
  });

  it("should handle SymbolReg call expressions", () => {
    const symbolRegNode: CallExpressionNode = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "SymbolReg" },
      arguments: [{ type: NodeKind.StringLiteral, value: "test" }],
    };
    const result = transformer<symbol>(symbolRegNode);
    assert.strictEqual(typeof result, "symbol");
    assert.strictEqual(result.description, "test");
  });

  it("should handle class deserialization", () => {
    class TestClass {
      value: string;
      constructor(value: string) {
        this.value = value;
      }
    }

    const classRegNode: CallExpressionNode = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "ClassReg" },
      arguments: [
        { type: NodeKind.StringLiteral, value: "TestClass" },
        {
          type: NodeKind.ObjectExpression,
          properties: [
            {
              type: NodeKind.ObjectProperty,
              key: { type: NodeKind.Identifier, value: "value" },
              value: { type: NodeKind.StringLiteral, value: "test" },
            },
          ],
        },
      ],
    };

    const jsonx = new JSONX();
    jsonx.classRegistry.register("TestClass", TestClass);

    const result = transformer<TestClass>(classRegNode, "#", new Map(), jsonx);
    assert.ok(result instanceof TestClass);
    assert.strictEqual(result.value, "test");
  });

  it("should handle Boolean call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Boolean" },
      arguments: [{ type: NodeKind.StringLiteral, value: "true" }],
    };
    const result = transformer(node);
    assert.deepStrictEqual(result, new Boolean(true));
  });

  it("should handle Number call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Number" },
      arguments: [{ type: NodeKind.StringLiteral, value: "123" }],
    };
    const result = transformer(node);
    assert.deepStrictEqual(result, new Number(123));
  });

  it("should handle BigInt call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "BigInt" },
      arguments: [{ type: NodeKind.StringLiteral, value: "9007199254740991" }],
    };
    const result = transformer(node);
    assert.deepStrictEqual(result, Object(BigInt("9007199254740991")));
  });

  it("should handle String call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "String" },
      arguments: [{ type: NodeKind.StringLiteral, value: "hello" }],
    };
    const result = transformer(node);
    assert.deepStrictEqual(result, Object("hello"));
  });

  it("should handle Date call expression", () => {
    const dateStr = "2024-01-01T00:00:00.000Z";
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Date" },
      arguments: [{ type: NodeKind.StringLiteral, value: dateStr }],
    };
    const result = transformer(node);
    assert.ok(result instanceof Date);
    assert.deepStrictEqual(result.toISOString(), dateStr);
  });

  it("should handle RegExp call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "RegExp" },
      arguments: [
        {
          type: NodeKind.ObjectExpression,
          properties: [
            {
              type: NodeKind.ObjectProperty,
              key: { type: NodeKind.Identifier, value: "source" },
              value: { type: NodeKind.StringLiteral, value: "abc" },
            },
            {
              type: NodeKind.ObjectProperty,
              key: { type: NodeKind.Identifier, value: "flags" },
              value: { type: NodeKind.StringLiteral, value: "gi" },
            },
          ],
        },
      ],
    };
    const result = transformer(node);
    assert.ok(result instanceof RegExp);
    assert.strictEqual(result.source, "abc");
    assert.strictEqual(result.flags, "gi");
  });

  it("should handle Set call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Set" },
      arguments: [
        {
          type: NodeKind.ArrayExpression,
          elements: [
            { type: NodeKind.NumberLiteral, value: 1 },
            { type: NodeKind.NumberLiteral, value: 2 },
          ],
        },
      ],
    };
    const result = transformer(node);
    assert.ok(result instanceof Set);
    assert.deepStrictEqual([...result], [1, 2]);
  });

  it("should handle Map call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Map" },
      arguments: [
        {
          type: NodeKind.ArrayExpression,
          elements: [
            {
              type: NodeKind.ArrayExpression,
              elements: [
                { type: NodeKind.StringLiteral, value: "a" },
                { type: NodeKind.NumberLiteral, value: 1 },
              ],
            },
          ],
        },
      ],
    };
    const result = transformer(node);
    assert.ok(result instanceof Map);
    assert.strictEqual(result.get("a"), 1);
  });

  it("should handle Error call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Error" },
      arguments: [
        {
          type: NodeKind.ObjectExpression,
          properties: [
            {
              type: NodeKind.ObjectProperty,
              key: { type: NodeKind.Identifier, value: "name" },
              value: { type: NodeKind.StringLiteral, value: "Error" },
            },
            {
              type: NodeKind.ObjectProperty,
              key: { type: NodeKind.Identifier, value: "message" },
              value: { type: NodeKind.StringLiteral, value: "fail" },
            },
          ],
        },
      ],
    };
    const result = transformer(node);
    assert.ok(result instanceof Error);
    assert.strictEqual(result.message, "fail");
  });

  it("should handle ArrayBuffer call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "ArrayBuffer" },
      arguments: [
        {
          type: NodeKind.ArrayExpression,
          elements: [
            { type: NodeKind.NumberLiteral, value: 1 },
            { type: NodeKind.NumberLiteral, value: 2 },
          ],
        },
      ],
    };
    const result = transformer(node);
    assert.ok(result instanceof ArrayBuffer);
    assert.deepStrictEqual([...new Uint8Array(result)], [1, 2]);
  });

  it("should handle Int8Array call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Int8Array" },
      arguments: [
        {
          type: NodeKind.ArrayExpression,
          elements: [
            { type: NodeKind.NumberLiteral, value: 1 },
            { type: NodeKind.NumberLiteral, value: 2 },
          ],
        },
      ],
    };
    const result = transformer(node);
    assert.ok(result instanceof Int8Array);
    assert.deepStrictEqual([...result], [1, 2]);
  });

  it("should handle Float64Array call expression", () => {
    const node = {
      type: NodeKind.CallExpression,
      callee: { type: NodeKind.Identifier, value: "Float64Array" },
      arguments: [
        {
          type: NodeKind.ArrayExpression,
          elements: [
            { type: NodeKind.NumberLiteral, value: 1.1 },
            { type: NodeKind.NumberLiteral, value: 2.2 },
          ],
        },
      ],
    };
    const result = transformer(node);
    assert.ok(result instanceof Float64Array);
    assert.deepStrictEqual([...result], [1.1, 2.2]);
  });
});
