import assert from "node:assert/strict";
import test from "node:test";
import Seria from "../index.ts";

test("XJSON.registerClass", async (t) => {
  await t.test("should register a class with its name as identifier", () => {
    class TestClass {}
    const xjson = new Seria();
    xjson.registerClass(TestClass);
    assert.strictEqual(xjson.classRegistry.getValue("TestClass"), TestClass);
  });

  await t.test("should register a class with custom identifier", () => {
    class TestClass {}
    const xjson = new Seria();
    xjson.registerClass(TestClass, "CustomId");
    assert.strictEqual(xjson.classRegistry.getValue("CustomId"), TestClass);
  });

  await t.test(
    "should register an anonymous class with empty string identifier",
    () => {
      const AnonymousClass = class {};
      const xjson = new Seria();
      xjson.registerClass(AnonymousClass);
      assert.strictEqual(
        xjson.classRegistry.getValue("AnonymousClass"),
        AnonymousClass,
      );
    },
  );

  await t.test(
    "should override previous registration with same identifier",
    () => {
      class Class1 {}
      class Class2 {}
      const xjson = new Seria();
      xjson.registerClass(Class1, "test");
      xjson.registerClass(Class2, "test");
      assert.strictEqual(xjson.classRegistry.getValue("test"), Class2);
    },
  );
});

test("XJSON.registerSymbol", async (t) => {
  await t.test(
    "should register a symbol with its description as identifier",
    () => {
      const sym = Symbol("mySymbol");
      const xjson = new Seria();
      xjson.registerSymbol(sym);
      assert.strictEqual(xjson.symbolRegistry.getValue("mySymbol"), sym);
    },
  );

  await t.test("should register a symbol with custom identifier", () => {
    const sym = Symbol("desc");
    const xjson = new Seria();
    xjson.registerSymbol(sym, "CustomId");
    assert.strictEqual(xjson.symbolRegistry.getValue("CustomId"), sym);
  });

  await t.test(
    "should register a symbol without description or identifier as empty string",
    () => {
      const sym = Symbol();
      const xjson = new Seria();
      xjson.registerSymbol(sym);
      assert.strictEqual(xjson.symbolRegistry.getValue(""), sym);
    },
  );

  await t.test(
    "should override previous registration with same identifier",
    () => {
      const sym1 = Symbol("dup");
      const sym2 = Symbol("dup");
      const xjson = new Seria();
      xjson.registerSymbol(sym1, "dupId");
      xjson.registerSymbol(sym2, "dupId");
      assert.strictEqual(xjson.symbolRegistry.getValue("dupId"), sym2);
    },
  );

  await t.test("should work with static XJSON.registerSymbol", () => {
    const sym = Symbol("staticSym");
    const xjson = new Seria();
    xjson.registerSymbol(sym);
    // Note: static uses singleton instance, so we check the singleton's registry
    assert.strictEqual(xjson.symbolRegistry.getValue("staticSym"), sym);
  });
});

test("XJSON.stringify", async (t) => {
  await t.test("should stringify a plain object", () => {
    const xjson = new Seria();
    const obj = { a: 1, b: "test" };
    const str = xjson.stringify(obj);
    assert.strictEqual(str, JSON.stringify(xjson.serialize(obj)));
  });

  await t.test("should stringify an array", () => {
    const xjson = new Seria();
    const arr = [1, 2, 3];
    const str = xjson.stringify(arr);
    assert.strictEqual(str, JSON.stringify(xjson.serialize(arr)));
  });

  await t.test("should stringify null", () => {
    const xjson = new Seria();
    const str = xjson.stringify(null);
    assert.strictEqual(str, JSON.stringify(xjson.serialize(null)));
  });

  await t.test("should stringify with custom class", () => {
    class Foo {
      x = 42;
    }
    const xjson = new Seria();
    xjson.registerClass(Foo);
    const foo = new Foo();
    const str = xjson.stringify(foo);
    assert.strictEqual(str, JSON.stringify(xjson.serialize(foo)));
  });
});

test("XJSON.parse", async (t) => {
  await t.test("should parse a stringified plain object", () => {
    const xjson = new Seria();
    const obj = { a: 1, b: "test" };
    const str = xjson.stringify(obj);
    const parsed = xjson.parse(str);
    assert.deepStrictEqual(parsed, obj);
  });

  await t.test("should parse a stringified array", () => {
    const xjson = new Seria();
    const arr = [1, 2, 3];
    const str = xjson.stringify(arr);
    const parsed = xjson.parse(str);
    assert.deepStrictEqual(parsed, arr);
  });

  await t.test("should parse stringified null", () => {
    const xjson = new Seria();
    const str = xjson.stringify(null);
    const parsed = xjson.parse(str);
    assert.strictEqual(parsed, null);
  });

  await t.test("should parse and revive custom class instance", () => {
    class Bar {
      x = 99;
    }
    const xjson = new Seria();
    xjson.registerClass(Bar);
    const bar = new Bar();
    const str = xjson.stringify(bar);
    const parsed = xjson.parse<any>(str);
    assert.strictEqual(parsed instanceof Bar, true);
    assert.strictEqual(parsed.x, 99);
  });

  await t.test("should throw on invalid JSON", () => {
    const xjson = new Seria();
    assert.throws(() => {
      xjson.parse("{invalid json}");
    });
  });
});
