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
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `Answer the question using only the provided context. If the context doesn't contain the answer, say so.

          Respond in plain prose only — no markdown tables, no headers, no bold text, no bullet lists, no code blocks unless explicitly asked to show code. Maximum 3 sentences. Do not explain the full pipeline end-to-end unless specifically asked to "walk through" or "explain in detail" — just answer the direct question.

          Example:
          Question: "how does logging work here?"
          Answer: "Logging goes through the logger in src/logger.ts, which wraps pino. Every service imports it and calls logger.info or logger.error instead of console.log for structured, filterable output."`,
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
  const rawAnswer = data.choices[0].message.content;
  const cleanAnswer = rawAnswer.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return cleanAnswer;
}
