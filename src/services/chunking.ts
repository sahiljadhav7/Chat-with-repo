export interface Chunk {
  content: string;
  startLine: number;
  endLine: number;
}

export function chunkText(
  text: string,
  maxChars = 1000,
  overlapChars = 200,
): Chunk[] {
  const lines = text.split("\n");
  const chunks: Chunk[] = [];
  let buffer: string[] = [];
  let bufferChars = 0;
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    buffer.push(lines[i]);
    bufferChars += lines[i].length + 1;

    if (bufferChars >= maxChars) {
      chunks.push({ content: buffer.join("\n"), startLine, endLine: i });
      // step back for overlap
      const overlapLines = Math.ceil(overlapChars / 80); // rough estimate
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
