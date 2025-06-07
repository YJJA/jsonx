import { JSONX, type ClassType } from "@jsonx/utils";
import parse from "./parse/index.ts";
import stringify from "./stringify.ts";

// Typify
export default class Typify extends JSONX {
  parse(value?: string) {
    return parse(value, "#", new Map<string, any>(), this);
  }

  stringify(value: unknown) {
    return stringify(value, "#", new Map<WeakKey, string>(), this);
  }

  private static instance = new Typify();
  static registerSymbol = Typify.instance.registerSymbol.bind(Typify.instance);
  static registerClass = Typify.instance.registerClass.bind<
    (value: ClassType, identifier?: string) => void
  >(Typify.instance);
  static stringify = Typify.instance.stringify.bind(Typify.instance);
  static parse = Typify.instance.parse.bind(Typify.instance);
}
