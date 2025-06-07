// Types
export const Types = {
  // Primitive types
  Undefined: "$udf",
  Null: "$null",
  Boolean: "$bool",
  Number: "$num",
  BigInt: "$bint",
  String: "$str",
  Symbol: "$sym",
  // built-in data type
  Array: "$arr",
  Object: "$obj",
  RegExp: "$regx",
  Date: "$date",
  URL: "$url",
  URLSearchParams: "$urlsp",
  Error: "$err",
  Set: "$set",
  Map: "$map",
  // buffer
  ArrayBuffer: "$buf",
  SharedArrayBuffer: "$sbuf",
  DataView: "$dv",
  Int8Array: "$i8a",
  Uint8Array: "$u8a",
  Uint8ClampedArray: "$u8ca",
  Int16Array: "$i16a",
  Uint16Array: "$u16a",
  Int32Array: "$i32a",
  Uint32Array: "$u32a",
  Float32Array: "$f32a",
  Float64Array: "$f64a",
  BigInt64Array: "$i64a",
  BigUint64Array: "$u64a",
  // custom
  JsonType: "$json",
  ClassType: "$class",
  ReferenceType: "$ref",
} as const;

export type SeriaUndefinedType = [type: typeof Types.Undefined];
export type SeriaNullType = [type: typeof Types.Null];
export type SeriaBooleanType = [type: typeof Types.Boolean, boolean];
export type SeriaNumberValue = "NaN" | "Infinity" | "-Infinity" | number;
export type SeriaNumberType = [
  type: typeof Types.Number,
  value: SeriaNumberValue,
];
export type SeriaBigIntType = [type: typeof Types.BigInt, value: string];
export type SeriaStringType = [type: typeof Types.String, value: string];
export type SeriaSymbolValue =
  | {
      global: true;
      key: string;
    }
  | {
      global: false;
      key?: string;
    };
export type SeriaSymbolType = [type: typeof Types.Symbol, SeriaSymbolValue];

// built in
export type SeriaArrayValue = SeriaValue[];
export type SeriaArrayType = [type: typeof Types.Array, value: SeriaArrayValue];
export type SeriaObjectValue = [SeriaValue, SeriaValue][];
export type SeriaObjectType = [
  type: typeof Types.Object,
  value: SeriaObjectValue,
];
export type SeriaRegExpValue = { source: string; flags?: string };
export type SeriaRegExpType = [name: typeof Types.RegExp, SeriaRegExpValue];
export type SeriaDateType = [name: typeof Types.Date, value: string];
export type SeriaURLType = [name: typeof Types.URL, value: string];
export type SeriaURLSearchParamsType = [
  name: typeof Types.URLSearchParams,
  value: string,
];
export type SeriaErrorValue = {
  name: string;
  message: string;
  stack?: string;
  cause?: SeriaValue;
  props: SeriaObjectValue;
};
export type SeriaErrorType = [name: typeof Types.Error, value: SeriaErrorValue];
export type SeriaSetType = [name: typeof Types.Set, value: SeriaArrayValue];
export type SeriaMapType = [name: typeof Types.Map, value: SeriaObjectValue];

export type SeriaArrayBufferType = [
  name: typeof Types.ArrayBuffer,
  value: number[],
];
export type SeriaSharedArrayBufferType = [
  name: typeof Types.SharedArrayBuffer,
  value: number[],
];
export type SeriaDataViewType = [name: typeof Types.DataView, value: number[]];
export type SeriaInt8ArrayType = [
  name: typeof Types.Int8Array,
  value: number[],
];
export type SeriaUint8ArrayType = [
  name: typeof Types.Uint8Array,
  value: number[],
];
export type SeriaUint8ClampedArrayType = [
  name: typeof Types.Uint8ClampedArray,
  value: number[],
];
export type SeriaInt16ArrayType = [
  name: typeof Types.Int16Array,
  value: number[],
];
export type SeriaUint16ArrayType = [
  name: typeof Types.Uint16Array,
  value: number[],
];
export type SeriaInt32ArrayType = [
  name: typeof Types.Int32Array,
  value: number[],
];
export type SeriaUint32ArrayType = [
  name: typeof Types.Uint32Array,
  value: number[],
];
export type SeriaFloat32ArrayType = [
  name: typeof Types.Float32Array,
  value: number[],
];
export type SeriaFloat64ArrayType = [
  name: typeof Types.Float64Array,
  value: number[],
];
export type SeriaBigInt64ArrayType = [
  name: typeof Types.BigInt64Array,
  value: string[],
];
export type SeriaBigUint64ArrayType = [
  name: typeof Types.BigUint64Array,
  value: string[],
];

export type SeriaJsonType = [
  type: typeof Types.JsonType,
  name: string,
  value: SeriaValue,
];
export type SeriaClassType = [
  type: typeof Types.ClassType,
  name: string,
  value: SeriaObjectValue,
];
export type SeriaReferenceType = [
  type: typeof Types.ReferenceType,
  ptr: string,
];

// value type
export type SeriaValue =
  | undefined
  | SeriaUndefinedType
  | SeriaNullType
  | SeriaBooleanType
  | SeriaBigIntType
  | SeriaNumberType
  | SeriaStringType
  | SeriaSymbolType
  | SeriaArrayType
  | SeriaObjectType
  | SeriaRegExpType
  | SeriaDateType
  | SeriaURLType
  | SeriaURLSearchParamsType
  | SeriaErrorType
  | SeriaSetType
  | SeriaMapType
  | SeriaArrayBufferType
  | SeriaSharedArrayBufferType
  | SeriaDataViewType
  | SeriaInt8ArrayType
  | SeriaUint8ArrayType
  | SeriaUint8ClampedArrayType
  | SeriaInt16ArrayType
  | SeriaUint16ArrayType
  | SeriaInt32ArrayType
  | SeriaUint32ArrayType
  | SeriaFloat32ArrayType
  | SeriaFloat64ArrayType
  | SeriaBigInt64ArrayType
  | SeriaBigUint64ArrayType
  | SeriaJsonType
  | SeriaClassType
  | SeriaReferenceType;

export type SeriaType =
  // Primitive type
  | undefined
  | null
  | boolean
  | number
  | bigint
  | string
  | symbol
  // built in
  | RegExp
  | URL
  | URLSearchParams
  | Date
  | Error
  | Set<SeriaType>
  | Map<SeriaType, SeriaType>
  | Array<SeriaType>
  | SeriaObjectValueType
  // buffer
  | ArrayBuffer
  | SharedArrayBuffer
  | DataView
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export interface SeriaObjectValueType {
  [key: string | symbol]: SeriaType;
}
