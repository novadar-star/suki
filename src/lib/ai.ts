import "server-only";
import { z } from "zod";

export const aiMode = process.env.OPENAI_API_KEY ? "live" : "demo";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export class AiError extends Error {}

// Calls OpenAI and returns JSON checked against the schema.
// Tries twice. The second try tells the model what was wrong.
export async function generateJson<T>(opts: {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  temperature?: number;
}): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new AiError("No OpenAI key set.");

  const shape = JSON.stringify(z.toJSONSchema(opts.schema));
  let prompt = `${opts.prompt}\n\nReturn only JSON that matches this JSON Schema:\n${shape}`;
  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: opts.temperature ?? 0.9,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 401) throw new AiError("OpenAI rejected the key. Check OPENAI_API_KEY.");
      if (res.status === 429)
        throw new AiError("OpenAI rate limit or quota reached. Wait a minute, or check the billing on your OpenAI account.");
      throw new AiError(`OpenAI returned ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = opts.schema.safeParse(JSON.parse(text));
      if (parsed.success) return parsed.data;
      lastError = z.prettifyError(parsed.error);
    } catch {
      lastError = "The reply was not valid JSON.";
    }
    prompt = `${prompt}\n\nYour last reply was rejected:\n${lastError}\nFix it and reply again with JSON only.`;
  }
  throw new AiError(`OpenAI reply did not match the expected format. ${lastError.slice(0, 300)}`);
}
