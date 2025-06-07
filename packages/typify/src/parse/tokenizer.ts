// token kind
export const TokenKind = {
  Punctuator: "punctuator",
  String: "string",
  Number: "number",
  BigInt: "bigint",
  Boolean: "boolean",
  Null: "null",
  Undefined: "undefined",
  Identifier: "identifier",
} as const;

export type TokenKind = (typeof TokenKind)[keyof typeof TokenKind];

type Punctuation = "{" | "}" | "[" | "]" | "(" | ")" | ":" | ",";

type PunctuatorToken = {
  type: typeof TokenKind.Punctuator;
  value: Punctuation;
  raw: string;
};
type StringToken = {
  type: typeof TokenKind.String;
  value: string;
  raw: string;
};
type NumberToken = {
  type: typeof TokenKind.Number;
  value: number;
  raw: string;
};
type BigIntToken = {
  type: typeof TokenKind.BigInt;
  value: bigint;
  raw: string;
};
type BooleanToken = {
  type: typeof TokenKind.Boolean;
  value: boolean;
  raw: string;
};
type NullToken = {
  type: typeof TokenKind.Null;
  value: null;
  raw: string;
};
type UndefinedToken = {
  type: typeof TokenKind.Undefined;
  value: undefined;
  raw: string;
};
type IdentifierToken = {
  type: typeof TokenKind.Identifier;
  value: string;
  raw: string;
};

export type Token =
  | PunctuatorToken
  | StringToken
  | NumberToken
  | BigIntToken
  | BooleanToken
  | NullToken
  | UndefinedToken
  | IdentifierToken;

const unescapes = {
  "\\": "\\",
  '"': '"',
  "/": "/",
  b: "\b",
  t: "\t",
  n: "\n",
  f: "\f",
  r: "\r",
};

const charCodes = {
  "\t": 9,
  "\n": 10,
  "\r": 13,
  " ": 32,
  '"': 34,
  "(": 40,
  ")": 41,
  "+": 43,
  ",": 44,
  "-": 45,
  ".": 46,
  "0": 48,
  "9": 57,
  ":": 58,
  A: 65,
  E: 69,
  F: 70,
  Z: 90,
  "[": 91,
  "\\": 92,
  "]": 93,
  _: 95,
  a: 97,
  e: 101,
  f: 102,
  n: 110,
  z: 122,
  "{": 123,
  "}": 125,
} as const;

function isWhitespaceChar(char: string): char is "\t" | "\n" | "\r" | " " {
  const charCode = char.charCodeAt(0);
  return (
    charCode === charCodes["\t"] ||
    charCode === charCodes["\n"] ||
    charCode === charCodes["\r"] ||
    charCode === charCodes[" "]
  );
}

function isPunctuatorChar(char: string): char is Punctuation {
  const charCode = char.charCodeAt(0);
  return (
    charCode === charCodes["{"] ||
    charCode === charCodes["}"] ||
    charCode === charCodes["["] ||
    charCode === charCodes["]"] ||
    charCode === charCodes["("] ||
    charCode === charCodes[")"] ||
    charCode === charCodes[":"] ||
    charCode === charCodes[","]
  );
}

function isNumberCharCode(charCode: number) {
  return charCode >= charCodes[0] && charCode <= charCodes[9];
}

function isHexadecimalCharCode(charCode: number) {
  return (
    (charCode >= charCodes[0] && charCode <= charCodes[9]) ||
    (charCode >= charCodes.a && charCode <= charCodes.f) ||
    (charCode >= charCodes.A && charCode <= charCodes.F)
  );
}

function isValidCharCode(charCode: number) {
  return charCode !== charCodes["\\"] && charCode !== charCodes['"'];
}

function isIdentifierChar(char: string) {
  const charCode = char.charCodeAt(0);
  return (
    (charCode >= charCodes.a && charCode <= charCodes.z) ||
    (charCode >= charCodes.A && charCode <= charCodes.Z) ||
    (charCode >= charCodes[0] && charCode <= charCodes[9]) ||
    charCode === charCodes["-"] ||
    charCode === charCodes._
  );
}

export function tokenizer(source: string): Token[] {
  const length = source.length;
  let index = 0;

  function walk(): Token {
    // skip whitespace
    while (index < length && isWhitespaceChar(source[index]!)) {
      index++;
    }

    let char = source[index]!;

    // punctuator
    if (isPunctuatorChar(char)) {
      index++;
      return { type: TokenKind.Punctuator, value: char, raw: char };
    }

    // string
    if (char === '"') {
      const beginIndex = index++;
      let stringValue = "";

      while (index < length) {
        char = source[index]!;
        // if (char.charCodeAt(0) < charCodes[" "]) {
        //   console.log({ char });
        //   throw new Error(
        //     `Parsing error: Unescaped ASCII control chars are not permitted.`
        //   );
        // }

        if (char === "\\") {
          char = source[++index]!;
          switch (char) {
            case "\\":
            case '"':
            case "/":
            case "b":
            case "t":
            case "n":
            case "f":
            case "r":
              stringValue += unescapes[char];
              index++;
              break;

            case "u":
              const hexbegin = ++index;
              for (const position = index + 4; index < position; index++) {
                if (!isHexadecimalCharCode(source.charCodeAt(index))) {
                  throw new TypeError(
                    `Parsing error: Invalid Unicode escape sequence.`,
                  );
                }
              }

              stringValue += String.fromCharCode(
                parseInt("0x" + source.slice(hexbegin, index)),
              );
              break;

            default:
              stringValue += `\\${char}`;
              index++;
              // throw new TypeError(`Parsing error: Invalid escape sequence.`);
              break;
          }
        } else if (char === '"') {
          break;
        } else {
          const validbegin = index;
          while (index < length && isValidCharCode(source.charCodeAt(index))) {
            index++;
          }
          stringValue += source.slice(validbegin, index);
        }
      }

      if (source[index] === '"') {
        index++;
        return {
          type: TokenKind.String,
          value: stringValue,
          raw: source.slice(beginIndex, index),
        };
      }
      throw new TypeError(`Parsing error: Unterminated string.`);
    }

    // number or bigint
    if (
      (char === "-" && isNumberCharCode(source.charCodeAt(index + 1))) ||
      isNumberCharCode(source.charCodeAt(index))
    ) {
      const beginIndex = index;

      if (char === "-") {
        // if (!isNumberCharCode(source.charCodeAt(index + 1))) {
        //   throw new TypeError(
        //     `Parsing error: A negative sign may only precede numbers.`
        //   );
        // }
        char = source[++index]!;
      }

      // Leading zeroes are interpreted as octal literals.
      if (
        source.charCodeAt(index) === charCodes[0] &&
        isNumberCharCode(source.charCodeAt(index + 1))
      ) {
        throw new TypeError(`Parsing error: Illegal octal literal.`);
      }

      // integer component
      while (index < length && isNumberCharCode(source.charCodeAt(index))) {
        index++;
      }

      // bigint
      if (source.charCodeAt(index) === charCodes.n) {
        const numberString = source.slice(beginIndex, index);
        index++;

        return {
          type: TokenKind.BigInt,
          value: BigInt(numberString),
          raw: source.slice(beginIndex, index),
        };
      }

      // decimal component
      if (source.charCodeAt(index) === charCodes["."]) {
        let position = ++index;
        while (
          position < length &&
          isNumberCharCode(source.charCodeAt(position))
        ) {
          position++;
        }
        if (position === index) {
          throw new TypeError(`Parsing error: Illegal trailing decimal.`);
        }
        index = position;
      }

      // exponent component
      let charCode = source.charCodeAt(index);
      if (charCode === charCodes.e || charCode === charCodes.E) {
        charCode = source.charCodeAt(++index);
        if (charCode === charCodes["+"] || charCode === charCodes["-"]) {
          index++;
        }

        let position = ++index;
        while (
          position < length &&
          isNumberCharCode(source.charCodeAt(position))
        ) {
          position++;
        }
        if (position === index) {
          throw new TypeError(`Parsing error: Illegal empty exponent.`);
        }
        index = position;
      }

      const numberString = source.slice(beginIndex, index);
      return {
        type: TokenKind.Number,
        value: +numberString,
        raw: numberString,
      };
    }

    // identifier
    if (isIdentifierChar(char)) {
      let beginIndex = index++;
      while (index < length && isIdentifierChar(source[index]!)) {
        index++;
      }
      const idstr = source.slice(beginIndex, index);
      switch (idstr) {
        case "NaN":
          return { type: TokenKind.Number, value: NaN, raw: idstr };
        case "Infinity":
          return { type: TokenKind.Number, value: Infinity, raw: idstr };
        case "-Infinity":
          return { type: TokenKind.Number, value: -Infinity, raw: idstr };
        case "true":
          return { type: TokenKind.Boolean, value: true, raw: idstr };
        case "false":
          return { type: TokenKind.Boolean, value: false, raw: idstr };
        case "null":
          return { type: TokenKind.Null, value: null, raw: idstr };
        case "undefined":
          return { type: TokenKind.Undefined, value: undefined, raw: idstr };

        default:
          return { type: TokenKind.Identifier, value: idstr, raw: idstr };
      }
    }

    throw new TypeError(`Parsing error: ${index}, ${char}`);
  }

  const tokens: Token[] = [];

  while (index < length) {
    tokens.push(walk());
  }

  return tokens;
}
