// The campaigns list lives at /campaigns. "/" shows the landing page (see the rewrite in next.config.ts),
// so this route re-uses the list component from the root page file.
export { default } from "../page";

export const dynamic = "force-dynamic";
