/**
 * Design tokens for the SGS Raga Ragini Atlas.
 *
 * One shared palette/type/spacing system so every component reads as part
 * of the same considered whole, instead of ad-hoc inline hex codes.
 *
 * Palette intent: a deep indigo-black cosmos (Nada Brahma — sound as the
 * origin of creation, the night sky the globe floats in) carrying a warm
 * gold scale (temple gold leaf, not neon), with a marigold/saffron accent
 * and a muted deep-maroon depth tone drawn from temple and marigold-garland
 * imagery — used sparingly for active states and warmth, never as the base.
 */

export const color = {
  // Backgrounds — layered indigo-black instead of flat #000
  bgDeep: "#05060c",
  bgMid: "#0d0a1c",
  bgViolet: "#161029",
  bgRadial:
    "radial-gradient(ellipse at 50% 100%, #1c1633 0%, #0d0a1c 45%, #05060c 100%)",

  // Surfaces (panels, modals) — glassy, sit on top of the cosmos
  surface: "rgba(11, 9, 22, 0.92)",
  surfaceStrong: "rgba(8, 6, 17, 0.97)",
  surfaceBorder: "rgba(242, 193, 78, 0.22)",
  surfaceBorderSoft: "rgba(242, 193, 78, 0.14)",

  // Gold scale — the primary devotional/brand color
  gold: "#f2c14e", // primary text/border gold (warmer than pure #ffd700)
  goldBright: "#ffd76a", // hover/active glow
  goldDim: "rgba(242, 193, 78, 0.55)",
  goldFaint: "rgba(242, 193, 78, 0.12)",

  // Marigold / saffron accent — devotional warmth, used sparingly for CTAs
  // and active selections (continent filter, primary actions)
  marigold: "#ff9a3d",
  marigoldBright: "#ffb35c",

  // Deep maroon — a whisper of temple-cloth depth in shadows/borders, never
  // a base fill
  maroon: "#5c1a22",
  maroonSoft: "rgba(92, 26, 34, 0.35)",

  // Text
  textPrimary: "#f7f2e7", // warm off-white, not pure #fff
  textMuted: "rgba(247, 242, 231, 0.72)",
  textFaint: "rgba(247, 242, 231, 0.5)",

  // Status
  danger: "#ff6b6b",
};

export const font = {
  // Classical serif for titles/headings/event names — carved-inscription
  // elegance appropriate to an "Atlas" of a sacred tradition
  display: "'Marcellus', 'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  // Highly legible workhorse for body copy, long devotional paragraphs, and
  // UI chrome (buttons, inputs, labels)
  body: "'Inter', 'Roboto', -apple-system, Segoe UI, Arial, sans-serif",
};

export const radius = {
  sm: "8px",
  md: "14px",
  lg: "20px",
  pill: "999px",
};

export const shadow = {
  glowGold: "0 0 18px rgba(242, 193, 78, 0.35)",
  glowGoldStrong: "0 0 28px rgba(255, 215, 106, 0.55)",
  panel: "0 20px 60px rgba(0, 0, 0, 0.55)",
  panelSoft: "0 10px 30px rgba(0, 0, 0, 0.4)",
};

export const zIndex = {
  stars: 1,
  globe: 5,
  contentView: 8, // full-view List/Timeline panels — above globe, below chrome
  labels: 10,
  chrome: 20,
  menuBackdrop: 35,
  panel: 36,
  mobilePanel: 40,
  modal: 50,
  infoModal: 1100,
};

// Small helper so components can build consistent gold-glass borders without
// repeating the same rgba string everywhere.
export const glass = (opacity = 0.92) => `rgba(11, 9, 22, ${opacity})`;

const theme = { color, font, radius, shadow, zIndex, glass };

export default theme;
