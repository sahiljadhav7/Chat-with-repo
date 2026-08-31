/**
 * This file contains the embedding service that uses the Hugging Face API to generate embeddings for text.
 */

import { InferenceClient } from "@huggingface/inference";
import { env } from "../config/env";

const client = new InferenceClient(env.HF_API_KEY);

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

export async function embed(text: string): Promise<number[]> {
  const result = await client.featureExtraction({
    model: HF_MODEL,
    inputs: text,
    provider: "hf-inference",
  });

  return result as number[];
}
