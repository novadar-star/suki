import { aiMode } from "@/lib/ai";
import { DEMO_TREND_SAMPLE } from "@/lib/demo";
import { PageHeader } from "@/components/ui";
import { NewTrendForm } from "./form";

export default function NewTrendPage() {
  return (
    <>
      <PageHeader
        title="Add a reference"
        intro="Paste a link and describe the video in your own words. The AI reads only your description. It can't watch the video or see its numbers."
      />
      <NewTrendForm demo={aiMode === "demo"} sample={DEMO_TREND_SAMPLE} />
    </>
  );
}
