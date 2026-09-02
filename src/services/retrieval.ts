import { pool } from "../db/pool";
import { embed } from "./embeddings";

export async function retrieveChunks(question: string, repoId: number, k = 8) {
  const queryVector = await embed(question);
  const result = await pool.query(
    `SELECT file_path, content, start_line, end_line
     FROM chunks
     WHERE repo_id = $1
     ORDER BY embedding <-> $2
     LIMIT $3`,
    [repoId, JSON.stringify(queryVector), k],
  );
  return result.rows;
}
