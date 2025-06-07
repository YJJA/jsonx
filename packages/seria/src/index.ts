import { JSONX, type ClassType } from "@jsonx/utils";
import { deserialize } from "./deserialize.ts";
import { serialize } from "./serialize.ts";
import type { SeriaValue } from "./types.ts";

// Seria
export default class Seria extends JSONX {
  serialize(payload: unknown) {
    return serialize(payload, "#", new Map<symbol | object, string>(), this);
  }

  deserialize<T = unknown>(payload: SeriaValue): T {
    return deserialize(payload, "#", new Map<string, any>(), this) as T;
  }

  stringify(payload: unknown): string {
    return JSON.stringify(this.serialize(payload));
  }

  parse<T = unknown>(payload: string): T {
    return this.deserialize(JSON.parse(payload));
  }

  private static instance = new Seria();
  static registerSymbol = Seria.instance.registerSymbol.bind(Seria.instance);
  static registerClass = Seria.instance.registerClass.bind<
    (value: ClassType, identifier?: string) => void
  >(Seria.instance);
  static serialize = Seria.instance.serialize.bind(Seria.instance);
  static deserialize = Seria.instance.deserialize.bind(Seria.instance);
  static stringify = Seria.instance.stringify.bind(Seria.instance);
  static parse = Seria.instance.parse.bind(Seria.instance);
}
