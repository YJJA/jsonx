import { JSONX, type ClassType } from "@jsox/utils";
import {
  enumerableKeys,
  getDataType,
  hasFromJSON,
  hasToJSON,
  isObject,
  isSymbol,
} from "payload-is";
import { getTypeSerialize } from "./registers.ts";

// stringify
function _stringify(
  value: unknown,
  ptr: string = "#",
  refs: Map<WeakKey, string> = new Map(),
  jsonx?: JSONX,
): string | undefined {
  // refs
  if (isObject(value) || isSymbol(value)) {
    const symref = refs.get(value);
    if (typeof symref === "string") return `Ref(${JSON.stringify(symref)})`;
    refs.set(value, ptr);
  }

  const dt = getDataType(value);
  switch (dt.type) {
    // undefined
    case "undefined":
      return `undefined`;

    // string
    case "string":
      return `${JSON.stringify(dt.data)}`;

    // number / boolean
    case "number":
    case "boolean":
      return `${dt.data}`;

    // bigint
    case "bigint":
      return `${dt.data}n`;

    // symbol
    case "symbol":
      let symkey = Symbol.keyFor(dt.data);
      if (typeof symkey === "string") {
        return `SymbolFor(${_stringify(symkey)})`;
      }

      // symbolRegistry
      symkey = jsonx?.symbolRegistry?.getKey(dt.data);
      if (typeof symkey === "string") {
        return `SymbolReg(${_stringify(symkey)})`;
      }

      symkey = dt.data.description;
      return `Symbol(${symkey ? _stringify(symkey) : ""})`;

    // null
    case "null":
      return "null";

    // object
    case "object":
      // array
      if (Array.isArray(dt.data)) {
        return `[${dt.data
          .map((val, i) => _stringify(val, `${ptr}/[${i}]`, refs))
          .join(",")}]`;
      }

      // serialize
      const serialize = getTypeSerialize(dt.subtype);
      if (serialize) {
        return `${dt.subtype}(${_stringify(
          serialize(dt.data),
          `${ptr}/${dt.subtype}`,
          refs,
        )})`;
      }

      // classRegistry
      if (dt.data.constructor) {
        const classType = dt.data.constructor as ClassType;
        const className = jsonx?.classRegistry?.getKey(classType);
        if (className) {
          if (hasFromJSON(classType) && hasToJSON(dt.data)) {
            const subtype = "ClassJson";
            return `${subtype}(${_stringify(className)}, ${_stringify(
              dt.data.toJSON(),
              `${ptr}/${subtype}`,
              refs,
            )})`;
          }
          const subtype = "ClassReg";
          return `${subtype}(${_stringify(className)}, ${_stringify(
            dt.data,
            `${ptr}/${subtype}`,
            refs,
          )})`;
        }
      }

      // hasToJSON
      if (hasToJSON(dt.data)) {
        return _stringify(dt.data.toJSON(), ptr, refs);
      }

      // object
      return `{${enumerableKeys(dt.data)
        .map((key, i) => {
          return [
            _stringify(key, `${ptr}/[${i},0]`, refs),
            _stringify(Reflect.get(dt.data, key), `${ptr}/[${i},1]`, refs),
          ];
        })
        .map(([k, v]) => `${k}: ${v}`)
        .join(",")}}`;
  }

  return undefined;
}

export default function stringify(
  value: unknown,
  ptr?: string,
  refs?: Map<WeakKey, string>,
  jsonx?: JSONX,
) {
  return _stringify(value, ptr, refs, jsonx);
}
