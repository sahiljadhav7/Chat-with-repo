/**
 * Generates an answer based on a question and context using the LLM API.
 * @param question The question to ask.
 * @param context The context to use for generating the answer.
 * @returns A promise resolving to the generated answer.
 */

import { env } from "../config/env";

export async function generateAnswer(
  question: string,
  context: string,
): Promise<string> {
  const res = await fetch(`${env.LLM_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LLM_API_KEY}`,
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.LLM_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers questions based on the provided context. If the question is not related to the context, politely respond that you don't know.",
        },
        {
          role: "user",
          content: `Context: ${context}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
