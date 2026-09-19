import { describe, expect, it } from "vitest";
import type { Element, Root } from "hast";
import rehypeCodeBlocks from "./rehypeCodeBlocks";

function fixture(language: string, source: string): { tree: Root; code: Element } {
  const code: Element = {
    type: "element", tagName: "code", properties: {},
    children: [{ type: "element", tagName: "span", properties: { className: ["line"] }, children: [{ type: "text", value: source }] }],
  };
  return { code, tree: { type: "root", children: [{ type: "element", tagName: "pre", properties: { dataLanguage: language }, children: [code] }] } };
}

describe("构建时代码块", () => {
  it.each([["a\nb\n", "1\n2"], ["", "1"], ["a\n\n", "1\n2"]])("生成行号，保留原始代码 %j", (source, numbers) => {
    const { tree, code } = fixture("ts", source);
    const original = structuredClone(code);
    rehypeCodeBlocks()(tree);
    const wrapper = tree.children[0] as Element;
    const body = wrapper.children[1] as Element;
    const pre = body.children[0] as Element;
    expect(pre.children[0]).toMatchObject({ tagName: "span", properties: { className: ["code-block__line-numbers"], ariaHidden: "true" }, children: [{ type: "text", value: numbers }] });
    expect(pre.children[1]).toEqual(original);
    expect(pre.children[1]).toBe(code);
  });

  it.each(["mermaid", "math"])("不包装 %s", (language) => {
    const { tree } = fixture(language, "A --> B");
    const original = structuredClone(tree);
    rehypeCodeBlocks()(tree);
    expect(tree).toEqual(original);
  });

  it("重复处理不会嵌套包装或重复生成行号", () => {
    const { tree } = fixture("ts", "const a = 1;");
    rehypeCodeBlocks()(tree);
    const once = structuredClone(tree);
    rehypeCodeBlocks()(tree);
    expect(tree).toEqual(once);
  });
});