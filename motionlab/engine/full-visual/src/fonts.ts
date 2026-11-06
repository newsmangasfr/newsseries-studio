// Fonts a theme may name. To use another face: load it here, then set theme.font in the reel's reel.json.
// Geist, Bricolage Grotesque, Kode Mono, Poppins, Instrument Serif (italic), Oswald and Fraunces serve the ready-made styles in styles/.
import { loadFont as figtree } from "@remotion/google-fonts/Figtree";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as jetbrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as geist } from "@remotion/google-fonts/Geist";
import { loadFont as bricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as kodeMono } from "@remotion/google-fonts/KodeMono";
import { loadFont as poppins } from "@remotion/google-fonts/Poppins";
import { loadFont as instrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as oswald } from "@remotion/google-fonts/Oswald";
import { loadFont as fraunces } from "@remotion/google-fonts/Fraunces";

const opts = { subsets: ["latin" as const] };
export const fontsReady = Promise.all([
  figtree("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
  inter("normal", { weights: ["400", "500", "600", "700"], ...opts }).waitUntilDone(),
  jetbrains("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
  geist("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
  bricolage("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
  kodeMono("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
  poppins("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
  instrumentSerif("italic", { weights: ["400"], ...opts }).waitUntilDone(),
  oswald("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
  fraunces("normal", { weights: ["400", "700"], ...opts }).waitUntilDone(),
]);
