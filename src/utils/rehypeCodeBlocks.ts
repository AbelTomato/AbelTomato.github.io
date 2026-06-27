import type { Element, Nodes, Parent, Root, Text } from "hast";

const languageLabels: Record<string, { label: string; className: string }> = {
  // 前端与脚本语言
  js: { label: "JavaScript", className: "lang-js" },
  javascript: { label: "JavaScript", className: "lang-js" },
  ts: { label: "TypeScript", className: "lang-ts" },
  typescript: { label: "TypeScript", className: "lang-ts" },
  jsx: { label: "JSX", className: "lang-jsx" },
  tsx: { label: "TSX", className: "lang-tsx" },
  html: { label: "HTML", className: "lang-html" },
  css: { label: "CSS", className: "lang-css" },
  scss: { label: "SCSS", className: "lang-scss" },
  less: { label: "Less", className: "lang-less" },

  // 后端与系统编程
  py: { label: "Python", className: "lang-py" },
  python: { label: "Python", className: "lang-py" },
  go: { label: "Go", className: "lang-go" },
  golang: { label: "Go", className: "lang-go" },
  java: { label: "Java", className: "lang-java" },
  c: { label: "C", className: "lang-c" },
  cpp: { label: "C++", className: "lang-cpp" },
  "c++": { label: "C++", className: "lang-cpp" },
  cs: { label: "C#", className: "lang-cs" },
  csharp: { label: "C#", className: "lang-cs" },
  rs: { label: "Rust", className: "lang-rust" },
  rust: { label: "Rust", className: "lang-rust" },
  php: { label: "PHP", className: "lang-php" },
  rb: { label: "Ruby", className: "lang-ruby" },
  ruby: { label: "Ruby", className: "lang-ruby" },

  // 数据、配置与标记语言
  json: { label: "JSON", className: "lang-json" },
  yaml: { label: "YAML", className: "lang-yaml" },
  yml: { label: "YAML", className: "lang-yaml" },
  xml: { label: "XML", className: "lang-xml" },
  md: { label: "Markdown", className: "lang-md" },
  markdown: { label: "Markdown", className: "lang-md" },
  toml: { label: "TOML", className: "lang-toml" },
  ini: { label: "INI", className: "lang-ini" },

  // 数据库与查询语言
  sql: { label: "SQL", className: "lang-sql" },
  mysql: { label: "MySQL", className: "lang-mysql" },
  pgsql: { label: "PostgreSQL", className: "lang-postgres" },
  graphql: { label: "GraphQL", className: "lang-graphql" },

  // 运维、终端与脚本
  sh: { label: "Shell", className: "lang-shell" },
  bash: { label: "Bash", className: "lang-bash" },
  zsh: { label: "Zsh", className: "lang-bash" },
  powershell: { label: "PowerShell", className: "lang-ps" },
  ps1: { label: "PowerShell", className: "lang-ps" },
  docker: { label: "Docker", className: "lang-docker" },
  dockerfile: { label: "Dockerfile", className: "lang-docker" },
  nginx: { label: "Nginx", className: "lang-nginx" },

  // 纯文本/未知兜底
  text: { label: "Text", className: "lang-text" },
  txt: { label: "Text", className: "lang-text" },
  plaintext: { label: "Text", className: "lang-text" },
};

function isElement(node: Nodes): node is Element {
  return node.type === "element";
}

function getLanguage(codeNode: Element): string {
  const className = codeNode.properties?.className;

  if (!Array.isArray(className)) {
    return "text";
  }

  const languageClass = className.find((item) =>
    String(item).startsWith("language-"),
  );

  return languageClass
    ? String(languageClass).replace("language-", "")
    : "text";
}

function getPreLanguage(preNode: Element): string {
  const dataLanguage = preNode.properties?.dataLanguage;

  if (typeof dataLanguage === "string" && dataLanguage.length > 0) {
    return dataLanguage;
  }

  const codeNode = preNode.children[0];

  if (!isElement(codeNode) || codeNode.tagName !== "code") {
    return "text";
  }

  return getLanguage(codeNode);
}

function getLanguageMeta(language: string): { label: string; className: string } {
  const normalizedLanguage = language.toLowerCase();

  return (
    languageLabels[normalizedLanguage] ?? {
      label: language || "Text",
      className: `lang-${normalizedLanguage || "text"}`,
    }
  );
}

function isValidCodePre(node: Nodes): node is Element {
  if (!isElement(node) || node.tagName !== "pre") {
    return false;
  }

  const codeNode = node.children[0];

  if (!isElement(codeNode) || codeNode.tagName !== "code") {
    return false;
  }

  const language = getPreLanguage(node).toLowerCase();
  return language !== "mermaid" && language !== "math";
}

function createTextNode(value: string): Text {
  return {
    type: "text",
    value,
  };
}

function createCodeBlockWrapper(node: Element): Element {
  const preNode = { ...node, children: [...node.children] };

  const language = getPreLanguage(preNode).toLowerCase();
  const languageMeta = getLanguageMeta(language);

  preNode.properties = {
    ...preNode.properties,
    dataLanguage: language,
  };

  return {
    type: "element",
    tagName: "div",
    properties: {
      className: ["code-block"],
      dataLanguage: language,
    },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: {
          className: ["code-block__header"],
        },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: {
              className: ["code-block__language", languageMeta.className],
            },
            children: [createTextNode(languageMeta.label)],
          },
          {
            type: "element",
            tagName: "button",
            properties: {
              className: ["code-block__toggle"],
              type: "button",
              ariaExpanded: "true",
              ariaLabel: "收起代码块",
            },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["code-block__toggle-text"],
                },
                children: [createTextNode("收起")],
              },
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["code-block__toggle-mark"],
                  ariaHidden: "true",
                },
                children: [],
              },
            ],
          },
        ],
      },
      {
        type: "element",
        tagName: "div",
        properties: {
          className: ["code-block__body"],
        },
        children: [preNode],
      },
    ],
  };
}

function walk(node: Nodes): void {
  if (!("children" in node)) {
    return;
  }

  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index];

    if (isValidCodePre(child)) {
      node.children[index] = createCodeBlockWrapper(child);
      continue;
    }

    walk(child);
  }
}

export default function rehypeCodeBlocks() {
  return (tree: Root): void => {
    walk(tree as Parent & Root);
  };
}
