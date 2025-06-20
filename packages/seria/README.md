# @jsox/seria

@jsox/seria is a TypeScript library that can serialize any JS/JSON data structure (including Symbol, Set, Map, etc.) into a string and supports deserializing it back to the original object, helping you easily achieve type-safe data serialization and deserialization.

## Features

- 🚀 Supports serialization/deserialization of any JS object, including Symbol, Set, Map, BigInt, RegExp, Error, and more
- 🏗️ Preserves complex nested structures
- 🔍 Smart inference of primitive types (string, number, boolean, etc.)
- 🛠️ Zero dependencies, ready to use out of the box

## Installation

```bash
npm install @jsox/seria
```

## Quick Start

```typescript
import Seria from "@jsox/seria";

const obj = {
  name: "John",
  age: 30,
  symbol: Symbol.for("unique"),
  set: new Set([1, 2, 3]),
  map: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
};

const str = Seria.stringify(obj);
console.log(str); // Serialized string

const restored = Seria.parse(str);
console.log(restored); // Restored original object
```

## API

### `Seria.stringify(value: unknown): string`

- **value**: The JS object to serialize (supports Symbol, Set, Map, BigInt, RegExp, Error, etc.)
- **Returns**: A string representing the serialized object

### `Seria.parse(str: string): unknown`

- **str**: The string generated by `Seria.stringify`
- **Returns**: The restored original JS object

## Use Cases

- Serialization and deserialization of complex JS objects
- Data persistence and transmission
- Type-safe data processing

## License

MIT
