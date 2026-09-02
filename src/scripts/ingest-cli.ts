import { cloneRepo, getCommitSha, cleanupClone } from "../services/github";
import { upsertRepo, markRepoIndexed } from "../services/repos";
import { ingestFolder } from "../services/ingest";
import { logger } from "../logger";

const githubUrl = process.argv[2];

if (!githubUrl) {
  console.error("Usage: npx ts-node src/scripts/ingest-cli.ts <github-url>");
  process.exit(1);
}

async function main() {
  const repoId = await upsertRepo(githubUrl);
  let localPath: string | undefined;

  try {
    logger.info(`Cloning ${githubUrl}...`);
    localPath = await cloneRepo(githubUrl);

    await ingestFolder(localPath, repoId);

    const commitSha = await getCommitSha(localPath);
    await markRepoIndexed(repoId, commitSha);
    logger.info(`Ingested ${githubUrl} at commit ${commitSha}`);
  } finally {
    if (localPath) await cleanupClone(localPath);
  }
}
main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
