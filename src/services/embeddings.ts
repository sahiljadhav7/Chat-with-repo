/**
 * This file contains the embedding service that uses the Hugging Face API to generate embeddings for text.
 */

import { HfInference } from "@huggingface/inference";
import { env } from "../config/env";

const hf = new HfInference(env.HF_API_KEY);

export async function embed(text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    provider: "hf-inference",
    inputs: text,
  });
  return result as number[];
}
