import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";
import Python from "tree-sitter-python";
import path from "path";

export interface Chunk {
  content: string;
  startLine: number;
  endLine: number;
}

const LANGUAGE_BY_EXT: Record<string, any> = {
  ".js": JavaScript,
  ".jsx": JavaScript,
  ".py": Python,
};

const CHUNKABLE_TYPES = new Set([
  "function_declaration",
  "method_definition",
  "class_declaration",
  "function_definition",
  "class_definition",
]);

function chunkWithAST(filePath: string, content: string): Chunk[] | null {
  const language = LANGUAGE_BY_EXT[path.extname(filePath)];
  if (!language) return null;

  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(content);

  const chunks: Chunk[] = [];

  function visit(node: Parser.SyntaxNode) {
    if (CHUNKABLE_TYPES.has(node.type)) {
      chunks.push({
        content: content.slice(node.startIndex, node.endIndex),
        startLine: node.startPosition.row,
        endLine: node.endPosition.row,
      });
      return; // don't descend - avoids double-chunking a method inside its class
    }
    for (const child of node.children) visit(child);
  }

  visit(tree.rootNode);
  return chunks.length > 0 ? chunks : null;
}

function naiveChunk(
  content: string,
  maxChars = 1000,
  overlapChars = 200,
): Chunk[] {
  const lines = content.split("\n");
  const chunks: Chunk[] = [];
  let buffer: string[] = [];
  let bufferChars = 0;
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    buffer.push(lines[i]);
    bufferChars += lines[i].length + 1;
    if (bufferChars >= maxChars) {
      chunks.push({ content: buffer.join("\n"), startLine, endLine: i });
      const overlapLines = Math.ceil(overlapChars / 80);
      buffer = buffer.slice(-overlapLines);
      bufferChars = buffer.join("\n").length;
      startLine = i - overlapLines + 1;
    }
  }
  if (buffer.length > 0) {
    chunks.push({
      content: buffer.join("\n"),
      startLine,
      endLine: lines.length - 1,
    });
  }
  return chunks;
}

export function chunkFile(filePath: string, content: string): Chunk[] {
  return chunkWithAST(filePath, content) ?? naiveChunk(content);
}
