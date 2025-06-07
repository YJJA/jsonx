import type { ClassType, JSONX } from "@jsonx/utils";
import {
  enumerableKeys,
  getDataType,
  hasFromJSON,
  hasToJSON,
  isObject,
  isSymbol,
} from "payload-is";
import type {
  SeriaSymbolValue,
  SeriaErrorValue,
  SeriaArrayValue,
  SeriaObjectValue,
  SeriaValue,
  SeriaNumberValue,
} from "./types.ts";
import { Types } from "./types.ts";
import {
  ObjectKeyIndex,
  ObjectValIndex,
  SetIndex,
  MapKeyIndex,
  MapValIndex,
  ArrayIndex,
} from "./util.ts";

// map set with index
function* mapIndexSet(value: Set<any>) {
  let idx = 0;
  for (const val of value) {
    yield [idx, val] as const;
    idx++;
  }
}

// map map with index
function* mapIndexMap(value: Map<any, any>) {
  let idx = 0;
  for (const [key, val] of value) {
    yield [idx, key, val] as const;
    idx++;
  }
}

// map object with index
function* mapIndexObject(value: object, excludeKeys: (string | symbol)[] = []) {
  let idx = 0;
  for (const key of enumerableKeys(value)) {
    if (!excludeKeys.includes(key)) {
      const val = Reflect.get(value, key);
      yield [idx, key, val] as const;
      idx++;
    }
  }
}

// serialize number
function serializeNumberValue(payload: number): SeriaNumberValue {
  if (Number.isNaN(payload)) {
    return "NaN";
  }
  if (payload === Infinity) {
    return "Infinity";
  }
  if (payload === -Infinity) {
    return "-Infinity";
  }
  return payload;
}

// serialize symbol
function serializeSymbolValue(
  payload: symbol,
  _ptr?: string,
  _refs?: Map<WeakKey, string>,
  jsonx?: JSONX,
): SeriaSymbolValue {
  let key = Symbol.keyFor(payload);
  if (typeof key === "string") {
    return { global: true, key };
  }

  key = jsonx?.symbolRegistry?.getKey(payload) ?? payload.description;
  return { global: false, key };
}

// serialize error
function serializeErrorValue(
  payload: Error,
  ptr?: string,
  refs?: Map<WeakKey, string>,
  jsonx?: JSONX,
): SeriaErrorValue {
  const errVal: SeriaErrorValue = {
    name: payload.name,
    message: payload.message,
    stack: payload.stack,
    props: [],
  };

  if (typeof payload.cause !== "undefined") {
    errVal.cause = serialize(payload.cause, `${ptr}/cause`, refs, jsonx);
  }

  for (const [idx, key, val] of mapIndexObject(payload, [
    "name",
    "message",
    "stack",
    "cause",
  ])) {
    errVal.props.push([
      serialize(key, `${ptr}/${ObjectKeyIndex(idx)}`, refs, jsonx),
      serialize(val, `${ptr}/${ObjectValIndex(idx)}`, refs, jsonx),
    ]);
  }
  return errVal;
}

// serialize set
function serializeSetValue(
  payload: Set<unknown>,
  ptr?: string,
  refs?: Map<WeakKey, string>,
  jsonx?: JSONX,
) {
  const result: SeriaArrayValue = [];
  for (const [idx, val] of mapIndexSet(payload)) {
    result.push(serialize(val, `${ptr}/${SetIndex(idx)}`, refs, jsonx));
  }
  return result;
}

// serialize map
function serializeMapValue(
  payload: Map<unknown, unknown>,
  ptr?: string,
  refs?: Map<WeakKey, string>,
  jsonx?: JSONX,
) {
  const result: SeriaObjectValue = [];
  for (const [idx, key, val] of mapIndexMap(payload)) {
    result.push([
      serialize(key, `${ptr}/${MapKeyIndex(idx)}`, refs, jsonx),
      serialize(val, `${ptr}/${MapValIndex(idx)}`, refs, jsonx),
    ]);
  }
  return result;
}

// serialize array
function serializeArrayValue(
  payload: unknown[],
  ptr?: string,
  refs?: Map<WeakKey, string>,
  jsonx?: JSONX,
) {
  const result: SeriaArrayValue = [];
  for (const [idx, val] of payload.entries()) {
    result.push(serialize(val, `${ptr}/${ArrayIndex(idx)}`, refs, jsonx));
  }
  return result;
}

// serialize object
function serializeObjectValue(
  payload: object,
  ptr?: string,
  refs?: Map<WeakKey, string>,
  jsonx?: JSONX,
) {
  const result: SeriaObjectValue = [];
  for (const [idx, key, val] of mapIndexObject(payload)) {
    result.push([
      serialize(key, `${ptr}/${ObjectKeyIndex(idx)}`, refs, jsonx),
      serialize(val, `${ptr}/${ObjectValIndex(idx)}`, refs, jsonx),
    ]);
  }
  return result;
}

// serialize
export function serialize(
  payload: unknown,
  ptr: string = "#",
  refs = new Map<WeakKey, string>(),
  jsonx?: JSONX,
): SeriaValue {
  const dt = getDataType(payload);

  if (isObject(payload) || isSymbol(payload)) {
    const symptr = refs.get(payload);
    if (typeof symptr === "string") return [Types.ReferenceType, symptr];
    refs.set(payload, ptr);
  }

  switch (dt.type) {
    case "undefined":
      return [Types.Undefined];
    case "null":
      return [Types.Null];
    case "boolean":
      return [Types.Boolean, dt.data];
    case "number":
      return [Types.Number, serializeNumberValue(dt.data)];
    case "bigint":
      return [Types.BigInt, dt.data.toString()];
    case "string":
      return [Types.String, dt.data];
    case "symbol":
      return [Types.Symbol, serializeSymbolValue(dt.data, ptr, refs, jsonx)];

    case "object":
      switch (dt.subtype) {
        case "Boolean":
          return [Types.Boolean, dt.data.valueOf()];
        case "Number":
          return [Types.Number, serializeNumberValue(dt.data.valueOf())];
        case "BigInt":
          return [Types.BigInt, dt.data.toString()];
        case "String":
          return [Types.String, dt.data.valueOf()];
        case "Symbol":
          return [
            Types.Symbol,
            serializeSymbolValue(dt.data.valueOf(), ptr, refs, jsonx),
          ];
        case "Error":
          return [Types.Error, serializeErrorValue(dt.data, ptr, refs, jsonx)];
        case "Set":
          return [Types.Set, serializeSetValue(dt.data, ptr, refs, jsonx)];
        case "Map":
          return [Types.Map, serializeMapValue(dt.data, ptr, refs, jsonx)];
        case "Date":
          return [Types.Date, dt.data.toISOString()];
        case "RegExp":
          return [
            Types.RegExp,
            { source: dt.data.source, flags: dt.data.flags },
          ];
        case "URL":
          return [Types.URL, dt.data.toString()];
        case "URLSearchParams":
          return [Types.URLSearchParams, dt.data.toString()];

        // buffer
        case "ArrayBuffer":
          return [Types.ArrayBuffer, [...new Uint8Array(dt.data)]];
        case "SharedArrayBuffer":
          return [Types.SharedArrayBuffer, [...new Uint8Array(dt.data)]];
        case "DataView":
          return [Types.DataView, [...new Uint8Array(dt.data.buffer)]];
        case "Int8Array":
          return [Types.Int8Array, [...dt.data]];
        case "Uint8Array":
          return [Types.Uint8Array, [...dt.data]];
        case "Uint8ClampedArray":
          return [Types.Uint8ClampedArray, [...dt.data]];
        case "Int16Array":
          return [Types.Int16Array, [...dt.data]];
        case "Uint16Array":
          return [Types.Uint16Array, [...dt.data]];
        case "Int32Array":
          return [Types.Int32Array, [...dt.data]];
        case "Uint32Array":
          return [Types.Uint32Array, [...dt.data]];
        case "Float32Array":
          return [Types.Float32Array, [...dt.data]];
        case "Float64Array":
          return [Types.Float64Array, [...dt.data]];
        case "BigInt64Array":
          return [Types.BigInt64Array, [...dt.data].map((v) => v.toString())];
        case "BigUint64Array":
          return [Types.BigUint64Array, [...dt.data].map((v) => v.toString())];

        case "Array":
          return [Types.Array, serializeArrayValue(dt.data, ptr, refs, jsonx)];
        case "Object":
          // class
          if (dt.data.constructor) {
            const classType = dt.data.constructor as ClassType;
            const className = jsonx?.classRegistry?.getKey(classType);
            if (className) {
              if (hasFromJSON(classType) && hasToJSON(dt.data)) {
                return [
                  Types.JsonType,
                  className,
                  serialize(dt.data.toJSON(), ptr, refs, jsonx),
                ];
              }

              return [
                Types.ClassType,
                className,
                serializeObjectValue(dt.data, ptr, refs, jsonx),
              ];
            }
          }

          // toJSON
          if (hasToJSON(dt.data)) {
            return serialize(dt.data.toJSON(), ptr, refs, jsonx);
          }

          // object
          return [
            Types.Object,
            serializeObjectValue(dt.data, ptr, refs, jsonx),
          ];

        default:
          return [Types.Object, []];
      }

    default:
      return undefined;
  }

  return undefined;
}
