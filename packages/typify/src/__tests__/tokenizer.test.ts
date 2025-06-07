import assert from "node:assert/strict";
import { it, describe } from "node:test";
import { tokenizer, TokenKind, type Token } from "../parse/tokenizer.ts";

describe("tokenizer", () => {
  it("Literal", { concurrency: true }, (t) => {
    const TestCases: [string, Token[]][] = [
      [
        "undefined",
        [{ type: TokenKind.Undefined, value: undefined, raw: "undefined" }],
      ],
      ["null", [{ type: TokenKind.Null, value: null, raw: "null" }]],
      ["true", [{ type: TokenKind.Boolean, value: true, raw: "true" }]],
      ["false", [{ type: TokenKind.Boolean, value: false, raw: "false" }]],
      [
        "false, true",
        [
          { type: TokenKind.Boolean, value: false, raw: "false" },
          { type: TokenKind.Punctuator, value: ",", raw: "," },
          { type: TokenKind.Boolean, value: true, raw: "true" },
        ],
      ],
    ];

    for (const [input, tokens] of TestCases) {
      t.test(input, () => {
        assert.deepStrictEqual(tokenizer(input), tokens);
      });
    }
  });

  it("string", { concurrency: true }, (t) => {
    const TestCases: [string, Token[]][] = [
      [
        '"this is text"',
        [
          {
            type: TokenKind.String,
            value: `this is text`,
            raw: '"this is text"',
          },
        ],
      ],
      [
        '"1212\\"12"',
        [{ type: TokenKind.String, value: `1212"12`, raw: '"1212\\"12"' }],
      ],
    ];

    for (const [input, tokens] of TestCases) {
      t.test(input, () => {
        assert.deepStrictEqual(tokenizer(input), tokens);
      });
    }
  });

  it("number", { concurrency: true }, (t) => {
    const TestCases: [string, Token[]][] = [
      ["12", [{ type: TokenKind.Number, value: 12, raw: "12" }]],
      ["12.234", [{ type: TokenKind.Number, value: 12.234, raw: "12.234" }]],
      ["-10", [{ type: TokenKind.Number, value: -10, raw: "-10" }]],
      [
        "1.222e12",
        [{ type: TokenKind.Number, value: 1.222e12, raw: "1.222e12" }],
      ],
      [
        "1.222e-12",
        [{ type: TokenKind.Number, value: 1.222e-12, raw: "1.222e-12" }],
      ],
      ["NaN", [{ type: TokenKind.Number, value: NaN, raw: "NaN" }]],
      [
        "Infinity",
        [{ type: TokenKind.Number, value: Infinity, raw: "Infinity" }],
      ],
      [
        "-Infinity",
        [{ type: TokenKind.Number, value: -Infinity, raw: "-Infinity" }],
      ],
    ];

    for (const [input, tokens] of TestCases) {
      t.test(input, () => {
        assert.deepStrictEqual(tokenizer(input), tokens);
      });
    }
  });

  it("bigint", { concurrency: true }, (t) => {
    const TestCases: [string, Token[]][] = [
      ["121212n", [{ type: TokenKind.BigInt, value: 121212n, raw: "121212n" }]],
    ];

    for (const [input, tokens] of TestCases) {
      t.test(input, () => {
        assert.deepStrictEqual(tokenizer(input), tokens);
      });
    }
  });

  it("symbol", { concurrency: true }, (t) => {
    const TestCases: [string, Token[]][] = [
      [
        "Symbol()",
        [
          { type: TokenKind.Identifier, value: "Symbol", raw: "Symbol" },
          { type: TokenKind.Punctuator, value: "(", raw: "(" },
          { type: TokenKind.Punctuator, value: ")", raw: ")" },
        ],
      ],
    ];

    for (const [input, tokens] of TestCases) {
      t.test(input, () => {
        assert.deepStrictEqual(tokenizer(input), tokens);
      });
    }
  });

  it("object", { concurrency: true }, (t) => {
    const TestCases: [string, Token[]][] = [
      [
        `{"a": null}`,
        [
          { type: TokenKind.Punctuator, value: "{", raw: "{" },
          { type: TokenKind.String, value: "a", raw: '"a"' },
          { type: TokenKind.Punctuator, value: ":", raw: ":" },
          { type: TokenKind.Null, value: null, raw: "null" },
          { type: TokenKind.Punctuator, value: "}", raw: "}" },
        ],
      ],
      [
        `{"a": 1212n}`,
        [
          { type: TokenKind.Punctuator, value: "{", raw: "{" },
          { type: TokenKind.String, value: "a", raw: '"a"' },
          { type: TokenKind.Punctuator, value: ":", raw: ":" },
          { type: TokenKind.BigInt, value: 1212n, raw: "1212n" },
          { type: TokenKind.Punctuator, value: "}", raw: "}" },
        ],
      ],
      [
        `{Symbol(): 123}`,
        [
          { type: TokenKind.Punctuator, value: "{", raw: "{" },
          { type: TokenKind.Identifier, value: "Symbol", raw: "Symbol" },
          { type: TokenKind.Punctuator, value: "(", raw: "(" },
          { type: TokenKind.Punctuator, value: ")", raw: ")" },
          { type: TokenKind.Punctuator, value: ":", raw: ":" },
          { type: TokenKind.Number, value: 123, raw: "123" },
          { type: TokenKind.Punctuator, value: "}", raw: "}" },
        ],
      ],
    ];

    for (const [input, tokens] of TestCases) {
      t.test(input, () => {
        assert.deepStrictEqual(tokenizer(input), tokens);
      });
    }
  });

  it("array", { concurrency: true }, (t) => {
    const TestCases: [string, Token[]][] = [
      [
        `[{"a": null}]`,
        [
          { type: TokenKind.Punctuator, value: "[", raw: "[" },
          { type: TokenKind.Punctuator, value: "{", raw: "{" },
          { type: TokenKind.String, value: "a", raw: '"a"' },
          { type: TokenKind.Punctuator, value: ":", raw: ":" },
          { type: TokenKind.Null, value: null, raw: "null" },
          { type: TokenKind.Punctuator, value: "}", raw: "}" },
          { type: TokenKind.Punctuator, value: "]", raw: "]" },
        ],
      ],
      [
        `[{"a": 1212n}]`,
        [
          { type: TokenKind.Punctuator, value: "[", raw: "[" },
          { type: TokenKind.Punctuator, value: "{", raw: "{" },
          { type: TokenKind.String, value: "a", raw: '"a"' },
          { type: TokenKind.Punctuator, value: ":", raw: ":" },
          { type: TokenKind.BigInt, value: 1212n, raw: "1212n" },
          { type: TokenKind.Punctuator, value: "}", raw: "}" },
          { type: TokenKind.Punctuator, value: "]", raw: "]" },
        ],
      ],
      [
        `[Symbol()]`,
        [
          { type: TokenKind.Punctuator, value: "[", raw: "[" },
          { type: TokenKind.Identifier, value: "Symbol", raw: "Symbol" },
          { type: TokenKind.Punctuator, value: "(", raw: "(" },
          { type: TokenKind.Punctuator, value: ")", raw: ")" },
          { type: TokenKind.Punctuator, value: "]", raw: "]" },
        ],
      ],
    ];

    for (const [input, tokens] of TestCases) {
      t.test(input, () => {
        assert.deepStrictEqual(tokenizer(input), tokens);
      });
    }
  });
});
