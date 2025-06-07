import { JSONX, assert } from "@jsox/utils";
import {
  hasFromJSON,
  isNumber,
  isPropertyKey,
  isString,
  isUndefined,
} from "payload-is";
import { getTypeDeserialize } from "../registers.ts";
import { NodeKind, type Node } from "./parser.ts";

function _transformer(
  node: Node,
  ptr: string = "#",
  refs = new Map<string, any>(),
  jsonx?: JSONX,
): unknown {
  let result: any = undefined;

  switch (node.type) {
    case NodeKind.Program:
      if (!node.body.length) {
        result = undefined;
      } else {
        result = _transformer(node.body[0]!);
      }
      break;

    case NodeKind.UndefinedLiteral:
    case NodeKind.NullLiteral:
    case NodeKind.BooleanLiteral:
    case NodeKind.NumberLiteral:
    case NodeKind.StringLiteral:
    case NodeKind.BigIntLiteral:
      result = node.value;
      break;

    case NodeKind.ArrayExpression:
      result = node.elements.map((el, idx) =>
        _transformer(el, `${ptr}/[${idx}]`, refs),
      );
      break;

    case NodeKind.ObjectExpression:
      result = node.properties.reduce<Record<PropertyKey, unknown>>(
        (result, property, i) => {
          const key =
            property.key.type === NodeKind.Identifier
              ? property.key.value
              : _transformer(property.key, `${ptr}/[${i},0]`, refs);

          if (!isPropertyKey(key)) {
            throw new Error(
              `Object keys must be string, number or symbol, got ${typeof key}`,
            );
          }
          result[key] = _transformer(property.value, `${ptr}/[${i},1]`, refs);
          return result;
        },
        {},
      );
      break;

    case NodeKind.CallExpression:
      const callee = node.callee.value;
      const [frist, secend] = node.arguments.map((arg) =>
        _transformer(arg, `${ptr}/${callee}`, refs),
      );

      switch (callee) {
        case "Ref":
          assert(isString(frist));
          result = refs.get(frist);
          break;

        case "Symbol":
          assert(isUndefined(frist) || isString(frist) || isNumber(frist));
          result = isUndefined(frist) ? Symbol() : Symbol(frist);
          break;

        case "SymbolFor":
          assert(isString(frist));
          result = Symbol.for(frist);
          break;

        case "SymbolReg":
          assert(isString(frist));
          result = jsonx?.symbolRegistry?.getValue(frist) ?? Symbol(frist);
          break;

        case "ClassJson":
          assert(isString(frist));
          const jsonType = jsonx?.classRegistry?.getValue(frist);
          if (typeof jsonType === "undefined") {
            console.warn(`Trying to deserialize unknown class '${frist}'`);
            result = secend;
          } else if (hasFromJSON(jsonType)) {
            result = jsonType.fromJSON(secend);
          } else {
            result = Object.assign(Object.create(jsonType.prototype), secend);
          }
          break;

        case "ClassReg":
          assert(isString(frist));
          const classType = jsonx?.classRegistry?.getValue(frist);
          if (typeof classType === "undefined") {
            console.warn(`Trying to deserialize unknown class '${frist}'`);
            result = secend;
          } else {
            result = Object.assign(Object.create(classType.prototype), secend);
          }
          break;

        default:
          const deserialize = getTypeDeserialize(callee);
          if (deserialize) {
            result = deserialize(callee, frist);
            break;
          }
      }
      break;

    default:
      throw new TypeError(`Unknown Node: ${node.type}`);
  }

  refs.set(ptr, result);
  return result;
}

export function transformer<T = unknown>(
  ast: Node,
  ptr?: string,
  refs?: Map<string, any>,
  jsonx?: JSONX,
): T {
  return _transformer(ast, ptr, refs, jsonx) as T;
}
