import { JSONX } from "@jsonx/utils";
import { parser as parse } from "./parser.ts";
import { tokenizer } from "./tokenizer.ts";
import { transformer } from "./transformer.ts";

export default function parser(
  input: string | undefined,
  ptr?: string,
  refs?: Map<string, any>,
  jsonx?: JSONX,
): any {
  if (!input) return;
  const tokens = tokenizer(input);
  const ast = parse(tokens);
  const data = transformer(ast, ptr, refs, jsonx);
  return data;
}
