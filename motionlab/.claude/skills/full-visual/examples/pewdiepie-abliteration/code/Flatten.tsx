// flatten, dark, 73.12-85.20: "Then you change the weights, because they decide where each request lands. You edit them
// so every request stays at the same height, like pressing the map flat. Everything else stays where it was, so the
// model keeps what it knows. It just can't climb to "no" anymore."
// Starts on HAND.arrow (with find's centre markers and label, faded on "weights"), ends on HAND.flat.
// "weights" = the camera cranes up and the weights rise under the map as a slab of numbers; "decide" = a request drops
// in, its row lights, a beam carries it up to its exact spot ("lands"); "edit" = a heavy glass press on four rods comes
// down along the arrow while a thin plate rises, and the slab's numbers roll red; "same height" = every point grows a
// stem to its footprint: the stems shrink, the footprints never move; "flat" = the plates meet with a jolt, the red
// corner squeezed level; "Everything" = the press lifts away, the camera cranes overhead: seen from above every point
// sits inside the ring of where it was; "knows" = each cluster named and ticked; "climb" = a refused request lands and
// strains toward the arrow's tip, the glass holds it, "no" is struck out, its reply is an answer.
import React from "react";
import { ease, prog, useScene } from "../../../src/engine";
import { type Pt, type V3, CAM_UP, ARROW_FROM, ARROW_TO, POINTS, CLUSTERS, flatten, project, turn } from "./map";
import { MapSpace } from "./MapSpace";
import { NO } from "./parts";
import { CentreMarker, FindDefs, Stems, camAt } from "./FindKit";
import { RefusalLabel } from "./Find";
import { PressBack, PressFront, PLANE_Y, plateCentre, pressOf, pressedY } from "./FlattenPress";
import { Route, Weights, routeHit } from "./FlattenWeights";
import { Climb, Footprints, Ghosts, Skills } from "./FlattenClimb";
import { ringPath } from "./FindKit";

const CAM_W = { ...CAM_UP, yaw: 0.46, pitch: 0.36, dist: 5.0, target: [0.1, 0.25, 0.15] as V3, cy: 755 };
const CAM_P = { ...CAM_W, yaw: 0.52, pitch: 0.3, dist: 5.1, cy: 770 };
const CAM_C = { ...CAM_UP, yaw: 0.42, pitch: 0.2, dist: 3.0, target: [0.15, PLANE_Y + 0.3, 0.12] as V3, cy: 1040 };
const CAM_TOP = { ...CAM_UP, yaw: 0.52, pitch: 1.36, dist: 4.6, target: [0.12, PLANE_Y, 0.2] as V3, cy: 1000 };
/** the request routed by the weights on "decide": the cooking point nearest its cluster's centre */
const ROUTED: Pt = POINTS.filter((q) => q.kind === "cooking").sort((a, b) =>
  Math.hypot(...(a.p.map((v, i) => v - CLUSTERS.cooking.centre[i]) as V3)) - Math.hypot(...(b.p.map((v, i) => v - CLUSTERS.cooking.centre[i]) as V3)))[0];

function useFlattenT() {
  const { cue, scene } = useScene();
  return {
    from: scene.from, end: scene.to, change: cue("change"), weights: cue("weights"), decide: cue("decide"), lands: cue("lands"),
    edit: cue("edit"), every: cue("every"), same: cue("same"), flat: cue("flat"), everything: cue("everything"), was: cue("was"),
    knows: cue("knows"), climb: cue("climb"), no: cue("no"), anymore: cue("anymore"),
  };
}
type FT = ReturnType<typeof useFlattenT>;

function cameraOf(f: number, T: FT) {
  const c = camAt(f, [
    [T.change - 6, CAM_UP], [T.decide - 4, CAM_W], [T.edit + 4, { ...CAM_W, yaw: 0.49 }], [T.same, CAM_P],
    [T.everything + 2, CAM_P], [T.was + 4, CAM_TOP], [T.knows + 8, { ...CAM_TOP, yaw: 0.6 }], [T.climb - 8, CAM_C], [T.anymore + 4, { ...CAM_C, yaw: 0.38, dist: 2.9 }], [T.end - 1, CAM_UP],
  ]);
  const dt = f - T.flat; // the plates meet: one heavy jolt
  const jolt = dt >= 0 && dt < 30 ? Math.sin(dt * 0.9) * Math.exp(-dt / 6) * 9 : 0;
  return { ...c, cy: c.cy + jolt };
}

/** where a point sits this frame: under the press while it runs, exactly turn(flatten(home, 1), 1) after */
function posOf(q: Pt, press: number): V3 {
  if (press >= 1) return turn(flatten(q.p, 1), 1);
  const h = turn(q.p, 1);
  return [h[0], pressedY(h[1], press), h[2]];
}

export const Flatten: React.FC & { keep?: boolean } = () => {
  const { f } = useScene();
  const T = useFlattenT();
  const cam = cameraOf(f, T);
  const P = (v: V3) => project(v, cam);
  const press = pressOf(f, T);
  const appear = prog(f, T.edit - 4, 22, ease.out), lift = prog(f, T.everything - 4, 18, ease.in);
  const sheet = prog(f, T.flat - 2, 10) * (1 - prog(f, T.end - 16, 12));
  const hit = routeHit(f, T);
  const look = (q: Pt) => {
    const h = turn(q.p, 1);
    const squeezed = press > 0 && press < 1 && h[1] > pressedY(h[1], press) + 0.01;
    if (q.id === ROUTED.id && f >= T.decide - 8 && hit <= 0) return { p: posOf(q, press), alpha: 0.12 };
    const k = q.id === ROUTED.id && hit > 0 ? 1 - hit : 0;
    return { p: posOf(q, press), r: 9 * (1 + 1.2 * k), glow: squeezed ? 1.3 : 1 + 1.2 * k };
  };
  const stemA = prog(f, T.every - 4, 18) * (1 - prog(f, T.knows + 6, 16)) * (1 - prog(f, T.end - 16, 12));
  const stems = POINTS.map((q) => ({ q, p: posOf(q, press), amt: prog(f, T.every - 4 + (q.id % 12), 16, ease.out), foot: 1 }));
  const shock = prog(f, T.flat, 34, ease.out);
  const markerA = 1 - prog(f, T.weights, 14);
  return (
    <>
      <PressBack cam={cam} p={press} appear={appear} lift={lift} sheet={sheet} />
      {stemA > 0 && <Stems cam={cam} items={stems} alpha={stemA} />}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><Footprints cam={cam} a={stemA} /></svg>
      <MapSpace cam={cam} look={look} axes={1 - prog(f, T.everything - 4, 20) * (1 - prog(f, T.knows + 10, 30))} arrow={{ from: ARROW_FROM(1), to: ARROW_TO(1), t: 1 }}>
        <FindDefs />
        <CentreMarker c={ARROW_FROM(1)} cam={cam} drop={1} impact={1} color="#FFFFFF" alpha={markerA} />
        <CentreMarker c={ARROW_TO(1)} cam={cam} drop={1} impact={1} color={NO} alpha={markerA} />
        {shock > 0 && shock < 1 && (
          <path d={ringPath(plateCentre, 0.3 + shock * 1.6, cam, 64)} fill="none" stroke="#DFF6FF" strokeWidth={4 * (1 - shock)} opacity={0.8 * (1 - shock)} />
        )}
        <Ghosts cam={cam} a={prog(f, T.everything + 6, 14) * (1 - prog(f, T.knows + 6, 14))} />
        <PressFront cam={cam} p={press} appear={appear} lift={lift} />
      </MapSpace>
      <Weights f={f} T={T} press={press} />
      <Route f={f} T={T} to={P(posOf(ROUTED, press))} />
      <RefusalLabel f={f} at={-999} end={T.end} P={P} out={T.weights - 6} />
      <Skills f={f} cam={cam} at={T.was} tick={T.knows - 4} out={T.knows + 12} />
      <Climb f={f} cam={cam} T={{ ...T, end: T.end }} />
    </>
  );
};
Flatten.keep = true;
