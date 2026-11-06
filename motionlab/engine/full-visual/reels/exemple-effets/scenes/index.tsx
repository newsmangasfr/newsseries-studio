// exemple-effets: one scene per effect of src/fx, on the voice of exemple-essai. A catalogue to look at, not a video.
import React from "react";
import { staticFile } from "remotion";
import type { SceneMap } from "../../../src/engine/Stage";
import { Beam, Column, Curve, Decode, Dust, Glass, Odometer, Orb, PixelReveal, Radar, useScene } from "../../../src/engine";

const Center: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <Column>
    <div style={{ position: "absolute", left: 0, top: 560, width: 900, height: 860, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      {children}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, color: "#8C8C8C", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  </Column>
);

const Hook: React.FC = () => {
  const { scene } = useScene();
  return <Center label="Odometer"><Odometer value={12480} start={scene.from + 6} suffix=" €" size={150} /></Center>;
};
const Answer: React.FC = () => {
  const { scene } = useScene();
  return <Center label="Decode"><Decode text="charge --rapide 65W" start={scene.from + 4} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 58, color: "#fff" }} /></Center>;
};
const Night: React.FC = () => {
  const { scene } = useScene();
  return <Center label="Orb"><Orb start={scene.from} busy size={380} /></Center>;
};
const Ions: React.FC = () => {
  const { scene } = useScene();
  return <Center label="Radar"><Radar start={scene.from} size={560}><div style={{ width: 90, height: 90, borderRadius: 24, background: "#41F9D3" }} /></Radar></Center>;
};
const Fast: React.FC = () => {
  const { scene } = useScene();
  return <Center label="Curve"><Curve points={[3, 4, 3.6, 5, 6.2, 5.8, 7.5, 9]} w={760} h={420} start={scene.from + 4} /></Center>;
};
const Protect: React.FC = () => {
  const { scene } = useScene();
  return (
    <Center label="Glass + Beam">
      <div style={{ position: "relative" }}>
        <Glass w={640} h={360} tint="rgba(20,20,30,0.06)">
          <div style={{ padding: 44, fontFamily: "Inter, sans-serif", fontSize: 44, fontWeight: 700, color: "#111" }}>Batterie protégée</div>
        </Glass>
        <Beam w={640} h={360} r={32} start={scene.from} color="#FF7A1A" />
      </div>
    </Center>
  );
};
const Case: React.FC = () => {
  const { scene } = useScene();
  return <Center label="PixelReveal"><PixelReveal src={staticFile("exemple-effets/photo.jpg")} w={600} h={600} start={scene.from + 4} /></Center>;
};
const End: React.FC = () => {
  const { scene } = useScene();
  return (
    <Center label="Dust">
      <Dust start={scene.from + 60} w={700} h={170} color="#FFFFFF">
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 140, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: "170px" }}>MotionLab</div>
      </Dust>
    </Center>
  );
};

export const scenes: SceneMap = { hook: Hook, answer: Answer, night: Night, ions: Ions, fast: Fast, protect: Protect, case: Case, end: End };
