import assert from "node:assert/strict";
import test from "node:test";
import Typify from "../index.ts";

test("JSONX", async (t) => {
  await t.test("Symbol registration", async (t) => {
    await t.test(
      "should register a symbol with explicit identifier",
      async () => {
        const sym = Symbol("test");
        const jsonx = new Typify();
        jsonx.registerSymbol(sym, "testSymbol");
        assert.strictEqual(jsonx.symbolRegistry.getValue("testSymbol"), sym);
      },
    );

    await t.test(
      "should register a symbol using description as identifier",
      async () => {
        const sym = Symbol("test");
        const jsonx = new Typify();
        jsonx.registerSymbol(sym);
        assert.strictEqual(jsonx.symbolRegistry.getValue("test"), sym);
      },
    );
  });

  await t.test("Class registration", async (t) => {
    await t.test(
      "should register a class with explicit identifier",
      async () => {
        class TestClass {}
        const jsonx = new Typify();
        jsonx.registerClass(TestClass, "TestClass");
        assert.strictEqual(
          jsonx.classRegistry.getValue("TestClass"),
          TestClass,
        );
      },
    );

    await t.test(
      "should register a class using class name as identifier",
      async () => {
        class TestClass {}
        const jsonx = new Typify();
        jsonx.registerClass(TestClass);
        assert.strictEqual(
          jsonx.classRegistry.getValue("TestClass"),
          TestClass,
        );
      },
    );
  });

  await t.test("Static methods", async (t) => {
    // await t.test(
    //   "should expose static methods that use singleton instance",
    //   async () => {
    //     const sym = Symbol("test");
    //     class TestClass {}

    //     JSONX.registerSymbol(sym, "testSymbol");
    //     JSONX.registerClass(TestClass, "TestClass");

    //     const instance = new JSONX();
    //     assert.strictEqual(instance.symbolRegistry.get("testSymbol"), sym);
    //     assert.strictEqual(instance.classRegistry.get("TestClass"), TestClass);
    //   }
    // );

    await t.test(
      "should have working static parse and stringify methods",
      async () => {
        const testObj = { foo: "bar" };
        const str = Typify.stringify(testObj);
        const parsed = Typify.parse(str);
        assert.deepStrictEqual(parsed, testObj);
      },
    );
  });
});
