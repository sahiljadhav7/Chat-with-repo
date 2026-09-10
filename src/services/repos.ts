import { pool } from "../db/pool";

export async function upsertRepo(githubUrl: string): Promise<number> {
  const result = await pool.query(
    `INSERT INTO repos (github_url) VALUES ($1)
        ON CONFLICT (github_url) DO UPDATE SET github_url = EXCLUDED.github_url
        RETURNING id`,
    [githubUrl],
  );
  return result.rows[0].id;
}

export async function markRepoIndexed(
  repoId: number,
  commitSha: string,
): Promise<void> {
  await pool.query(
    `UPDATE repos SET last_indexed_commit_sha = $1, last_indexed_at = now() WHERE id = $2`,
    [commitSha, repoId],
  );
}
