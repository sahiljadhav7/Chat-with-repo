import { Router } from "express";
import { retrieveChunks } from "../services/retrieval";
import { generateAnswer } from "../services/generation";
import { logger } from "../logger";

export const queryRouter = Router();

queryRouter.post("/", async (req, res) => {
  try {
    const { question, repoId } = req.body;
    if (!question)
      return res.status(400).json({ error: "question is required" });
    if (!repoId) return res.status(400).json({ error: "repoId is required" });

    const chunks = await retrieveChunks(question, repoId);
    const context = chunks
      .map((c) => `// ${c.file_path}\n${c.content}`)
      .join("\n\n---\n\n");
    const answer = await generateAnswer(question, context);

    res.json({ answer, sourcesUsed: chunks.length });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
