import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type UgcScene = { visual: string; voiceover: string; onScreen: string };
export type UgcProps = { accountName: string; color: string; scenes: UgcScene[] };

export const FPS = 30;
export const SCENE_FRAMES = 90; // 3 seconds per scene
export const ugcDuration = (p: UgcProps) => Math.max(1, p.scenes.length) * SCENE_FRAMES;

const ink = "#1c1f23";
const paper = "#f5f6f3";
const font = "'Bricolage Grotesque Variable', 'Instrument Sans Variable', system-ui, sans-serif";

function Scene({ scene, index, total, p }: { scene: UgcScene; index: number; total: number; p: UgcProps }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // One main action per scene: the caption settles in. The product only breathes slightly.
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const subIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const breathe = 1 + Math.sin(frame / 30) * 0.008;
  const progress = interpolate(frame, [0, SCENE_FRAMES], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink }}>
      <div style={{ position: "absolute", top: 56, left: 56, right: 56, display: "flex", gap: 10 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 8, borderRadius: 8, background: "#dcdfda", overflow: "hidden" }}>
            <div style={{ height: "100%", background: ink, width: `${i < index ? 100 : i === index ? progress * 100 : 0}%` }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 100, left: 56, display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 600 }}>
        <div style={{ width: 28, height: 28, borderRadius: 28, background: p.color }} />
        {p.accountName}
      </div>
      <div style={{ position: "absolute", top: 180, left: 56, right: 56, fontSize: 30, color: "#5f6670", lineHeight: 1.3 }}>
        Shot: {scene.visual}
      </div>

      <div
        style={{
          position: "absolute",
          top: 330,
          left: 56,
          right: 56,
          padding: "28px 36px",
          borderRadius: 28,
          background: p.color,
          color: "white",
          fontSize: 78,
          fontWeight: 700,
          lineHeight: 1.08,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 40}px)`,
        }}
      >
        {scene.onScreen}
      </div>

      <Img
        src={staticFile("product/serum.svg")}
        style={{ position: "absolute", left: 290, top: 820, width: 500, borderRadius: 40, transform: `scale(${breathe})` }}
      />

      {scene.voiceover && (
        <div
          style={{
            position: "absolute",
            bottom: 170,
            left: 80,
            right: 80,
            textAlign: "center",
            fontSize: 46,
            fontWeight: 600,
            lineHeight: 1.2,
            opacity: subIn,
          }}
        >
          <span style={{ background: ink, color: "white", padding: "6px 18px", borderRadius: 14, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
            {scene.voiceover}
          </span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 56, right: 56, fontSize: 26, color: "#5f6670" }}>AI-generated animatic</div>
    </AbsoluteFill>
  );
}

export function Ugc(p: UgcProps) {
  return (
    <AbsoluteFill style={{ background: paper }}>
      {p.scenes.map((s, i) => (
        <Sequence key={i} from={i * SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
          <Scene scene={s} index={i} total={p.scenes.length} p={p} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
