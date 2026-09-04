import fs from "fs";
import path from "path";
import { pool } from "../db/pool";
import { chunkFile } from "./chunking";
import { embed } from "./embeddings";
import { logger } from "../logger";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "vendor"]);
const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rb",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".php",
  ".rs",
  ".md",
]);
const MAX_FILE_SIZE_BYTES = 500_000;

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

function shouldIndexFile(filePath: string): boolean {
  if (!CODE_EXTENSIONS.has(path.extname(filePath))) return false;
  return fs.statSync(filePath).size <= MAX_FILE_SIZE_BYTES;
}

export async function ingestFolder(folderPath: string, repoId: number) {
  const files = walk(folderPath).filter(shouldIndexFile);
  logger.info(`Found ${files.length} indexable files`);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const chunks = chunkFile(file, content);
    const relativePath = path.relative(folderPath, file);

    for (const chunk of chunks) {
      const vector = await embed(chunk.content);

      await pool.query(
        `INSERT INTO chunks
       (repo_id, file_path, content, start_line, end_line, embedding)
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          repoId,
          relativePath,
          chunk.content,
          chunk.startLine,
          chunk.endLine,
          JSON.stringify(vector),
        ],
      );
    }

    logger.info(`Finished ingesting ${relativePath}`);
  }
}
