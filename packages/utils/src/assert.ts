// assert
export function assert(
  val: boolean,
  message: string = `Parsing error: Invalid.`,
): asserts val {
  if (!val) {
    throw new TypeError(message);
  }
}
