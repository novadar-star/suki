import "server-only";
import { z } from "zod";

export const aiMode = process.env.GEMINI_API_KEY ? "live" : "demo";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export class AiError extends Error {}

// Calls Gemini and returns JSON checked against the schema.
// Tries twice. The second try tells the model what was wrong.
export async function generateJson<T>(opts: {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  temperature?: number;
}): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("No Gemini key set.");

  const shape = JSON.stringify(z.toJSONSchema(opts.schema));
  let prompt = `${opts.prompt}\n\nReturn only JSON that matches this JSON Schema:\n${shape}`;
  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: opts.system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: opts.temperature ?? 0.9 },
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new AiError("Gemini rate limit reached. Wait a minute and try again.");
      throw new AiError(`Gemini returned ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    try {
      const parsed = opts.schema.safeParse(JSON.parse(text));
      if (parsed.success) return parsed.data;
      lastError = z.prettifyError(parsed.error);
    } catch {
      lastError = "The reply was not valid JSON.";
    }
    prompt = `${prompt}\n\nYour last reply was rejected:\n${lastError}\nFix it and reply again with JSON only.`;
  }
  throw new AiError(`Gemini reply did not match the expected format. ${lastError.slice(0, 300)}`);
}
