import type { StudioData } from "@/lib/types";
import { accounts } from "./accounts";
import { brand } from "./brand";

// What a new workspace starts with. Edits made in the app are saved and replace these.
export const seedData: StudioData = { brand, accounts };
