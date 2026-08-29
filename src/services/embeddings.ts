/**
 * This file contains the embedding service that uses the Hugging Face API to generate embeddings for text.
 */

import { env } from "../config/env";

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    },
  );

  if (!res.ok) {
    throw new Error(
      `Embedding request failed: ${res.status} ${await res.text()}`,
    );
  }

  return res.json() as Promise<number[]>;
}
