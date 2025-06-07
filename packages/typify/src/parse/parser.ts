import { TokenKind, type Token } from "./tokenizer.ts";

export const NodeKind = {
  Program: "Program",
  UndefinedLiteral: "UndefinedLiteral",
  NullLiteral: "NullLiteral",
  BooleanLiteral: "BooleanLiteral",
  StringLiteral: "StringLiteral",
  NumberLiteral: "NumberLiteral",
  BigIntLiteral: "BigIntLiteral",
  Identifier: "Identifier",
  CallExpression: "CallExpression",
  ObjectExpression: "ObjectExpression",
  ObjectProperty: "ObjectProperty",
  ArrayExpression: "ArrayExpression",
} as const;

export type NodeKind = (typeof NodeKind)[keyof typeof NodeKind];

export type ProgramNode = {
  type: typeof NodeKind.Program;
  body: Node[];
};
export type UndefinedLiteralNode = {
  type: typeof NodeKind.UndefinedLiteral;
  value: undefined;
};
export type NullLiteralNode = {
  type: typeof NodeKind.NullLiteral;
  value: null;
};
export type BooleanLiteralNode = {
  type: typeof NodeKind.BooleanLiteral;
  value: boolean;
};
export type StringLiteralNode = {
  type: typeof NodeKind.StringLiteral;
  value: string;
};
export type NumberLiteralNode = {
  type: typeof NodeKind.NumberLiteral;
  value: number;
};
export type BigIntLiteralNode = {
  type: typeof NodeKind.BigIntLiteral;
  value: bigint;
};
export type IdentifierNode = {
  type: typeof NodeKind.Identifier;
  value: string;
};
export type CallExpressionNode = {
  type: typeof NodeKind.CallExpression;
  callee: IdentifierNode;
  arguments: Node[];
};
export type ObjectExpressionNode = {
  type: typeof NodeKind.ObjectExpression;
  properties: ObjectPropertyNode[];
};
export type ObjectPropertyNode = {
  type: typeof NodeKind.ObjectProperty;
  key: IdentifierNode | CallExpressionNode;
  value: Node;
};
export type ArrayExpressionNode = {
  type: typeof NodeKind.ArrayExpression;
  elements: Node[];
};

export type Node =
  | ProgramNode
  | UndefinedLiteralNode
  | NullLiteralNode
  | BooleanLiteralNode
  | StringLiteralNode
  | NumberLiteralNode
  | BigIntLiteralNode
  | IdentifierNode
  | CallExpressionNode
  | ObjectExpressionNode
  | ArrayExpressionNode;

export function parser(tokens: Token[]) {
  let current = 0;

  function walk(): Node {
    let token = tokens[current]!;

    // undefined
    if (token.type === TokenKind.Undefined) {
      current++;
      return { type: NodeKind.UndefinedLiteral, value: undefined };
    }

    // null
    if (token.type === TokenKind.Null) {
      current++;
      return { type: NodeKind.NullLiteral, value: null };
    }

    // Boolean
    if (token.type === TokenKind.Boolean) {
      current++;
      return { type: NodeKind.BooleanLiteral, value: token.value };
    }

    // string
    if (token.type === TokenKind.String) {
      current++;
      return { type: NodeKind.StringLiteral, value: token.value };
    }

    // number
    if (token.type === TokenKind.Number) {
      current++;
      return { type: NodeKind.NumberLiteral, value: token.value };
    }

    // bigint
    if (token.type === TokenKind.BigInt) {
      current++;
      return { type: NodeKind.BigIntLiteral, value: token.value };
    }

    // array
    if (token.type === TokenKind.Punctuator && token.value === "[") {
      const node: ArrayExpressionNode = {
        type: NodeKind.ArrayExpression,
        elements: [],
      };

      token = tokens[++current]!;
      while (
        token.type !== TokenKind.Punctuator ||
        (token.type === TokenKind.Punctuator && token.value !== "]")
      ) {
        node.elements.push(walk());

        token = tokens[current]!;
        if (token.type === TokenKind.Punctuator && token.value === ",") {
          token = tokens[++current]!;
        }
      }

      current++;
      return node;
    }

    // object
    if (token.type === TokenKind.Punctuator && token.value === "{") {
      const node: ObjectExpressionNode = {
        type: NodeKind.ObjectExpression,
        properties: [],
      };

      token = tokens[++current]!;
      while (
        token.type !== TokenKind.Punctuator ||
        (token.type === TokenKind.Punctuator && token.value !== "}")
      ) {
        let key: IdentifierNode | CallExpressionNode;
        let next: Token;
        if (token.type === TokenKind.String) {
          key = {
            type: NodeKind.Identifier,
            value: token.value,
          };
          current += 1;
        } else if (
          token.type === TokenKind.Identifier &&
          ((next = tokens[current + 1]!), next.type === TokenKind.Punctuator) &&
          next.value === "("
        ) {
          key = walk() as CallExpressionNode;
        } else {
          throw new TypeError(`Parsing error: Invalid token. `);
        }

        current += 1;
        node.properties.push({
          type: NodeKind.ObjectProperty,
          key,
          value: walk(),
        });

        token = tokens[current]!;
        if (token.type === TokenKind.Punctuator && token.value === ",") {
          token = tokens[++current]!;
        }
      }

      current++;
      return node;
    }

    // Identifier
    if (token.type === TokenKind.Identifier) {
      let node: Node = { type: NodeKind.Identifier, value: token.value };

      token = tokens[++current]!;
      // call expression
      if (token.type === TokenKind.Punctuator && token.value === "(") {
        token = tokens[++current]!;
        node = {
          type: NodeKind.CallExpression,
          callee: node,
          arguments: [],
        };

        while (
          token.type !== TokenKind.Punctuator ||
          (token.type === TokenKind.Punctuator && token.value !== ")")
        ) {
          node.arguments.push(walk());
          token = tokens[current]!;
          if (token.type === TokenKind.Punctuator && token.value === ",") {
            token = tokens[++current]!;
          }
        }
      }

      current++;
      return node;
    }

    throw new TypeError(`Unprocessed token: ${JSON.stringify(token)}`);
  }

  const ast: ProgramNode = {
    type: NodeKind.Program,
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}
