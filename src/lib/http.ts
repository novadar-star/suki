import "server-only";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { AiError } from "./ai";
import { EngineError } from "./engine";

export function fail(e: unknown) {
  if (e instanceof ZodError) return NextResponse.json({ error: z.prettifyError(e) }, { status: 400 });
  if (e instanceof EngineError || e instanceof AiError) return NextResponse.json({ error: e.message }, { status: 422 });
  console.error(e);
  return NextResponse.json({ error: "Something went wrong on the server. Check the terminal for details." }, { status: 500 });
}

export const notFound = (what: string) => NextResponse.json({ error: `${what} not found.` }, { status: 404 });

export async function body(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
