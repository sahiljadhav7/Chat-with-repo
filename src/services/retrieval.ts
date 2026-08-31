import { pool } from "../db/pool";
import { embed } from "./embeddings";

export async function retrieveChunks(question: string, k = 8) {
  const queryVector = await embed(question);
  const result = await pool.query(
    `SELECT file_path, content, start_line, end_line
     FROM chunks
     ORDER BY embedding <-> $1
     LIMIT $2`,
    [JSON.stringify(queryVector), k],
  );
  return result.rows;
}
