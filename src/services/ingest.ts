import fs from "fs";
import path from "path";
import { pool } from "../db/pool";
import { chunkText } from "./chunking";
import { embed } from "./embeddings";
import { logger } from "../logger";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist"]);

function walk(dir: string): string[] {
  let results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walk(fullPath));
    else results.push(fullPath);
  }
  return results;
}

export async function ingestFolder(folderPath: string) {
  const files = walk(folderPath);
  logger.info(`Found ${files.length} files to ingest`);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const chunks = chunkText(content);

    for (const chunk of chunks) {
      const vector = await embed(chunk.content);
      await pool.query(
        `INSERT INTO chunks (file_path, content, start_line, end_line, embedding)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          file,
          chunk.content,
          chunk.startLine,
          chunk.endLine,
          JSON.stringify(vector),
        ],
      );
    }
    logger.info(`Ingested ${chunks.length} chunks from ${file}`);
  }
}
