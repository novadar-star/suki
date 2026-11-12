import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export type Kind = "campaign" | "trend";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

// Without Supabase: a file on your computer, or temporary server storage on Vercel.
export const storageMode = supabase ? "supabase" : process.env.VERCEL ? "temporary" : "file";

const FILE = process.env.VERCEL ? "/tmp/suki-db.json" : path.join(process.cwd(), ".data", "db.json");
type FileDb = Record<string, Record<string, unknown>>;

async function readFile(): Promise<FileDb> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeFile(db: FileDb) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}

export async function listDocs<T>(kind: Kind): Promise<T[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("docs")
      .select("data")
      .eq("kind", kind)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Could not load ${kind} records: ${error.message}`);
    return data.map((r) => r.data as T);
  }
  return Object.values((await readFile())[kind] ?? {}) as T[];
}

export async function getDoc<T>(kind: Kind, id: string): Promise<T | null> {
  if (supabase) {
    const { data, error } = await supabase.from("docs").select("data").eq("kind", kind).eq("id", id).maybeSingle();
    if (error) throw new Error(`Could not load ${kind} ${id}: ${error.message}`);
    return (data?.data as T) ?? null;
  }
  return ((await readFile())[kind]?.[id] as T) ?? null;
}

export async function putDoc<T>(kind: Kind, id: string, data: T): Promise<T> {
  if (supabase) {
    const { error } = await supabase
      .from("docs")
      .upsert({ kind, id, data, updated_at: new Date().toISOString() });
    if (error) throw new Error(`Could not save ${kind} ${id}: ${error.message}`);
    return data;
  }
  const db = await readFile();
  db[kind] = { ...(db[kind] ?? {}), [id]: data };
  await writeFile(db);
  return data;
}

export async function deleteDoc(kind: Kind, id: string) {
  if (supabase) {
    const { error } = await supabase.from("docs").delete().eq("kind", kind).eq("id", id);
    if (error) throw new Error(`Could not delete ${kind} ${id}: ${error.message}`);
    return;
  }
  const db = await readFile();
  delete db[kind]?.[id];
  await writeFile(db);
}
