import type { JSONX } from "@jsox/utils";
import { hasFromJSON } from "payload-is";
import type {
  SeriaSymbolValue,
  SeriaErrorValue,
  SeriaArrayValue,
  SeriaObjectValue,
  SeriaValue,
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

// deserialize symbol
function deserializeSymbolValue(
  value: SeriaSymbolValue,
  _ptr?: string,
  _refs?: Map<string, any>,
  jsonx?: JSONX,
) {
  if (value.global) {
    return Symbol.for(value.key);
  }
  if (value.key) {
    return jsonx?.symbolRegistry?.getValue(value.key) ?? Symbol(value.key);
  }
  return Symbol();
}

// deserialize error
function deserializeErrorValue(
  value: SeriaErrorValue,
  ptr?: string,
  refs?: Map<string, any>,
  jsonx?: JSONX,
): Error {
  let err = new Error(value.message);
  err.name = value.name;
  err.stack = value.stack;
  const cause = deserialize(value.cause, `${ptr}/cause`, refs, jsonx);
  if (typeof cause !== "undefined") {
    err.cause = cause;
  }

  for (const [idx, [key, val]] of value.props.entries()) {
    Reflect.set(
      err,
      deserialize(key, `${ptr}/${ObjectKeyIndex(idx)}`, refs, jsonx) as any,
      deserialize(val, `${ptr}/${ObjectValIndex(idx)}`, refs, jsonx),
    );
  }

  return err;
}

// deserialize set
function deserializeSetValue(
  value: SeriaArrayValue,
  ptr?: string,
  refs?: Map<string, any>,
  jsonx?: JSONX,
): Set<unknown> {
  const set = new Set<unknown>();
  for (const [idx, val] of value.entries()) {
    set.add(deserialize(val, `${ptr}/${SetIndex(idx)}`, refs, jsonx));
  }
  return set;
}

// deserialize map
function deserializeMapValue(
  value: SeriaObjectValue,
  ptr?: string,
  refs?: Map<string, any>,
  jsonx?: JSONX,
) {
  const map = new Map<unknown, unknown>();
  for (const [idx, [key, val]] of value.entries()) {
    map.set(
      deserialize(key, `${ptr}/${MapKeyIndex(idx)}`, refs, jsonx),
      deserialize(val, `${ptr}/${MapValIndex(idx)}`, refs, jsonx),
    );
  }
  return map;
}

// deserialize array
function deserializeArrayValue(
  value: SeriaArrayValue,
  ptr?: string,
  refs?: Map<string, any>,
  jsonx?: JSONX,
) {
  const arr: unknown[] = [];
  for (const [idx, val] of value.entries()) {
    arr.push(deserialize(val, `${ptr}/${ArrayIndex(idx)}`, refs, jsonx));
  }
  return arr;
}

// deserialize object
function deserializeObjectValue(
  value: SeriaObjectValue,
  ptr?: string,
  refs?: Map<string, any>,
  jsonx?: JSONX,
) {
  const obj: Record<string | symbol, unknown> = {};
  for (const [idx, [key, val]] of value.entries()) {
    Reflect.set(
      obj,
      deserialize(key, `${ptr}/${ObjectKeyIndex(idx)}`, refs, jsonx) as any,
      deserialize(val, `${ptr}/${ObjectValIndex(idx)}`, refs, jsonx),
    );
  }
  return obj;
}

// deserialize
export function deserialize(
  value: SeriaValue,
  ptr: string = "#",
  refs = new Map<string, any>(),
  jsonx?: JSONX,
): unknown {
  if (typeof value === "undefined") {
    return undefined;
  }

  let result: unknown;
  switch (value[0]) {
    case Types.Undefined:
      result = undefined;
      break;
    case Types.Null:
      result = null;
      break;
    case Types.String:
    case Types.Boolean:
      result = value[1];
      break;
    case Types.BigInt:
      result = BigInt(value[1]);
      break;
    case Types.Number:
      result = Number(value[1]);
      break;
    case Types.Symbol:
      result = deserializeSymbolValue(value[1], ptr, refs, jsonx);
      break;

    case Types.RegExp:
      result = new RegExp(value[1].source, value[1].flags);
      break;
    case Types.Date:
      result = new Date(value[1]);
      break;
    case Types.URL:
      result = new URL(value[1]);
      break;
    case Types.URLSearchParams:
      result = new URLSearchParams(value[1]);
      break;
    case Types.Error:
      result = deserializeErrorValue(value[1], ptr, refs, jsonx);
      break;
    case Types.Set:
      result = deserializeSetValue(value[1], ptr, refs, jsonx);
      break;
    case Types.Map:
      result = deserializeMapValue(value[1], ptr, refs, jsonx);
      break;

    case Types.Array:
      result = deserializeArrayValue(value[1], ptr, refs, jsonx);
      break;
    case Types.Object:
      result = deserializeObjectValue(value[1], ptr, refs, jsonx);
      break;

    case Types.ArrayBuffer:
      result = Uint8Array.from(value[1]).buffer;
      break;
    case Types.SharedArrayBuffer:
      const sbuffer = new Uint8Array(new SharedArrayBuffer(value[1].length));
      sbuffer.set(value[1]);
      result = sbuffer.buffer;
      break;
    case Types.DataView:
      result = new DataView(Uint8Array.from(value[1]).buffer);
      break;
    case Types.Int8Array:
      result = Int8Array.from(value[1]);
      break;
    case Types.Uint8Array:
      result = Uint8Array.from(value[1]);
      break;
    case Types.Uint8ClampedArray:
      result = Uint8ClampedArray.from(value[1]);
      break;
    case Types.Int16Array:
      result = Int16Array.from(value[1]);
      break;
    case Types.Uint16Array:
      result = Uint16Array.from(value[1]);
      break;
    case Types.Int32Array:
      result = Int32Array.from(value[1]);
      break;
    case Types.Uint32Array:
      result = Uint32Array.from(value[1]);
      break;
    case Types.Float32Array:
      result = Float32Array.from(value[1]);
      break;
    case Types.Float64Array:
      result = Float64Array.from(value[1]);
      break;
    case Types.BigInt64Array:
      result = BigInt64Array.from(value[1].map((v) => BigInt(v)));
      break;
    case Types.BigUint64Array:
      result = BigUint64Array.from(value[1].map((v) => BigInt(v)));
      break;

    case Types.ReferenceType:
      result = refs.get(value[1]);
      break;

    case Types.JsonType:
      const jsonVal = deserialize(value[2], ptr, refs, jsonx);
      const jsonType = jsonx?.classRegistry?.getValue(value[1]);
      if (!jsonType) {
        console.warn(`Trying to deserialize unknown class '${value[1]}'`);
        result = jsonVal;
      } else if (hasFromJSON(jsonType)) {
        result = jsonType.fromJSON(jsonVal);
      } else {
        result = Object.assign(Object.create(jsonType.prototype), jsonVal);
      }
      break;

    case Types.ClassType:
      const classVal = deserializeObjectValue(value[2], ptr, refs, jsonx);
      const classType = jsonx?.classRegistry?.getValue(value[1]);
      if (!classType) {
        console.warn(`Trying to deserialize unknown class '${value[1]}'`);
        result = classVal;
      } else {
        result = Object.assign(Object.create(classType.prototype), classVal);
      }
      break;
  }

  refs.set(ptr, result);
  return result;
}
