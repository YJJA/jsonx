# JSONX

JSONX is a modern TypeScript monorepo focused on advanced serialization, deserialization, and type utilities for JavaScript/TypeScript data. It safely and efficiently handles complex data structures including Symbol, Set, Map, BigInt, RegExp, Error, and more, making it suitable for data transmission, storage, and type-safe scenarios.

## Packages

- [`@jsonx/seria`](packages/seria/README.md): High-performance serialization and deserialization library supporting various complex data types. Features a simple API, zero dependencies, and is ideal for scenarios requiring strong type safety and performance.
- [`@jsonx/typify`](packages/typify/README.md): Type-aware serialization tool that preserves original type information, facilitating type inference and type-safe processing.
- [`@jsonx/utils`](packages/utils/package.json): Provides common utility functions and infrastructure for JSONX-related packages.

## Quick Start

Install any subpackage, for example:

```bash
npm install @jsonx/seria
```

Usage example:

```typescript
import Seria from "@jsonx/seria";

const obj = {
  name: "Alice",
  age: 28,
  symbol: Symbol.for("id"),
  set: new Set([1, 2, 3]),
  map: new Map([
    ["a", 1],
    ["b", 2],
  ]),
};

const str = Seria.stringify(obj);
const restored = Seria.parse(str);
console.log(restored);
```

## Use Cases

- Serialization and deserialization of complex JS objects
- Type-safe data persistence and transmission
- Frontend-backend data synchronization
- Advanced type inference and tooling

## Related Links

- [`@jsonx/seria`](packages/seria/README.md)
- [`@jsonx/typify`](packages/typify/README.md)

## License

MIT
