// ClassType
export type ClassType = {
  new (...args: any[]): any;
  displayName?: string;
};

// Registry
export class Registry<K, V> {
  readonly keyToValue = new Map<K, V>();
  readonly valueToKey = new Map<V, K>();
  register(key: K, value: V) {
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
  }
  getKey(value: V) {
    return this.valueToKey.get(value);
  }
  getValue(key: K) {
    return this.keyToValue.get(key);
  }
}

// JSONX
export class JSONX {
  readonly symbolRegistry = new Registry<string, symbol>();
  registerSymbol(value: symbol, identifier?: string) {
    identifier = identifier ?? value.description ?? "";
    this.symbolRegistry.register(identifier, value);
  }

  readonly classRegistry = new Registry<string, ClassType>();
  registerClass(value: ClassType, identifier?: string) {
    identifier = identifier ?? value.name ?? "";
    this.classRegistry.register(identifier, value);
  }
}
