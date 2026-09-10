import { simpleGit } from "simple-git";
import path from "path";
import os from "os";
import crypto from "crypto";
import fs from "fs";

export async function cloneRepo(githubUrl: string): Promise<string> {
  const localPath = path.join(os.tmpdir(), `chat-repo-${crypto.randomUUID()}`);
  const git = simpleGit();
  await git.clone(githubUrl, localPath, ["--depth", "1"]);

  return localPath;
}

export async function getCommitSha(localPath: string): Promise<string> {
  return (await simpleGit(localPath).revparse(["HEAD"])).trim();
}

export async function cleanupClone(localPath: string): Promise<void> {
  await fs.promises.rm(localPath, { recursive: true, force: true });
}
