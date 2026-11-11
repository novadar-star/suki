import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import { Composition } from "remotion";
import { FPS, Ugc, ugcDuration, type UgcProps } from "./ugc";

const sample: UgcProps = {
  accountName: "Student Finds",
  color: "#3563E9",
  scenes: [{ visual: "Dorm sink", voiceover: "Face wash first.", onScreen: "Step 1: cleanse" }],
};

export function Root() {
  return (
    <Composition
      id="Ugc"
      component={Ugc}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={ugcDuration(sample)}
      defaultProps={sample}
      calculateMetadata={({ props }) => ({ durationInFrames: ugcDuration(props) })}
    />
  );
}
