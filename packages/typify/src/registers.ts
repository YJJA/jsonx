import { assert } from "@jsonx/utils";
import {
  isArray,
  isBigIntArray,
  isMapEntries,
  isNumberArray,
  isObject,
  isString,
  isUndefined,
} from "payload-is";

// register
export type Registers<Type extends string, Data extends object> = Record<
  Type,
  {
    serialize(obj: Data): unknown;
    deserialize(type: Type, value: unknown): Data;
  }
>;

const Registers: Registers<string, object> = {};

function add<
  Type extends string,
  DS extends (type: Type, value: unknown) => any,
  Data extends ReturnType<DS> = ReturnType<DS>,
  S extends (obj: Data) => unknown = (obj: Data) => unknown,
>(type: Type, deserialize: DS, serialize: S) {
  Registers[type] = { serialize, deserialize };
}

export function getTypeSerialize(
  type: string,
): undefined | ((obj: object) => unknown) {
  return Registers[type]?.serialize;
}

export function getTypeDeserialize(
  type: string,
): undefined | ((type: string, value: unknown) => object) {
  return Registers[type]?.deserialize;
}

// Boolean
add(
  "Boolean",
  (_type, value) => {
    assert(isString(value));
    return new Boolean(value);
  },
  (obj) => obj.valueOf(),
);

// Number
add(
  "Number",
  (_type, value) => {
    assert(isString(value));
    return new Number(value);
  },
  (obj) => obj.valueOf(),
);

// BigInt
add(
  "BigInt",
  (_type, value): BigInt => {
    assert(isString(value));
    return Object(BigInt(value));
  },
  (obj) => obj.valueOf(),
);

// String
add(
  "String",
  (_type, value) => {
    assert(isString(value));
    return new String(value);
  },
  (obj) => obj.valueOf(),
);

// Symbol
add(
  "Symbol",
  (_type, value): Symbol => {
    assert(isString(value));
    return Object(Symbol(value));
  },
  (obj) => obj.valueOf(),
);

// Date
add(
  "Date",
  (_type, value) => {
    assert(isString(value));
    return new Date(value);
  },
  (obj) => obj.toISOString(),
);

// RegExp
add(
  "RegExp",
  (_type, value) => {
    assert(isObject(value));
    const source = Reflect.get(value, "source");
    assert(isString(source));
    const flags = Reflect.get(value, "flags");
    assert(isString(flags));
    return new RegExp(source, flags);
  },
  (obj) => {
    return { source: obj.source, flags: obj.flags };
  },
);

// URL
add(
  "URL",
  (_type, value) => {
    assert(isString(value));
    return new URL(value);
  },
  (obj) => obj.toString(),
);

// URLSearchParams
add(
  "URLSearchParams",
  (_type, value) => {
    assert(isString(value));
    return new URLSearchParams(value);
  },
  (obj) => obj.toString(),
);

// Set
add(
  "Set",
  (_type, value) => {
    assert(isArray(value));
    return new Set(value);
  },
  (obj) => [...obj],
);

// Map
add(
  "Map",
  (_type, value) => {
    assert(isMapEntries(value));
    return new Map(value);
  },
  (obj) => [...obj],
);

// Error
add(
  "Error",
  (_type, value) => {
    assert(isObject(value));
    const name = Reflect.get(value, "name");
    assert(isString(name));
    const message = Reflect.get(value, "message");
    assert(isString(message));
    const cause = Reflect.get(value, "cause");
    const options = isUndefined(cause) ? undefined : { cause };

    const result = new Error(message, options);
    for (const key of Reflect.ownKeys(value)) {
      if (key === "message" || key === "cause") {
        continue;
      }
      const val = Reflect.get(value, key);
      if (key === "name" && val === result.name) {
        continue;
      }
      Reflect.set(result, key, val);
    }
    return result;
  },
  (obj) => {
    return Reflect.ownKeys(obj).reduce(
      (result, key) => {
        result[key] = Reflect.get(obj, key);
        return result;
      },
      { name: obj.name } as Record<PropertyKey, unknown>,
    );
  },
);

// ArrayBuffer
add(
  "ArrayBuffer",
  (_type, value) => {
    assert(isNumberArray(value));
    return Uint8Array.from(value).buffer;
  },
  (obj) => [...new Uint8Array(obj)],
);

// SharedArrayBuffer
add(
  "SharedArrayBuffer",
  (_type, value) => {
    assert(isNumberArray(value));
    const _buffer = new Uint8Array(new SharedArrayBuffer(value.length));
    _buffer.set(value);
    return _buffer.buffer;
  },
  (obj) => [...new Uint8Array(obj)],
);

// DataView
add(
  "DataView",
  (_type, value) => {
    assert(isNumberArray(value));
    return new DataView(Uint8Array.from(value).buffer);
  },
  (obj) => [...new Uint8Array(obj.buffer)],
);

// Int8Array
add(
  "Int8Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Int8Array(value);
  },
  (obj) => [...obj],
);

// Uint8Array
add(
  "Uint8Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Uint8Array(value);
  },
  (obj) => [...obj],
);

// Uint8ClampedArray
add(
  "Uint8ClampedArray",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Uint8ClampedArray(value);
  },
  (obj) => [...obj],
);

// Int16Array
add(
  "Int16Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Int16Array(value);
  },
  (obj) => [...obj],
);

// Uint16Array
add(
  "Uint16Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Uint16Array(value);
  },
  (obj) => [...obj],
);

// Int32Array
add(
  "Int32Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Int32Array(value);
  },
  (obj) => [...obj],
);

// Uint32Array
add(
  "Uint32Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Uint32Array(value);
  },
  (obj) => [...obj],
);

// Float32Array
add(
  "Float32Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Float32Array(value);
  },
  (obj) => [...obj],
);

// Float64Array
add(
  "Float64Array",
  (_type, value) => {
    assert(isNumberArray(value));
    return new Float64Array(value);
  },
  (obj) => [...obj],
);

// BigInt64Array
add(
  "BigInt64Array",
  (_type, value) => {
    assert(isBigIntArray(value));
    return new BigInt64Array(value);
  },
  (obj) => [...obj],
);

// BigUint64Array
add(
  "BigUint64Array",
  (_type, value) => {
    assert(isBigIntArray(value));
    return new BigUint64Array(value);
  },
  (obj) => [...obj],
);
