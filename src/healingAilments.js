/**
 * Ailment → Raga associations for Guided Healing & Meditation (Beta).
 *
 * The Supabase table has no column that says "play this raga for a
 * headache" — but it does carry a "Healing Ragas" field on every event
 * (mapped to `event.raga` in App.jsx), which is exactly the traditional
 * raga-chikitsa lineage the site's own About section already describes
 * (raga, chakra and nadi correspondences per Raga Ragini Vidya). What
 * follows is a curated listening guide built on that lineage: each
 * ailment lists the ragas traditionally associated with it, matched as
 * case-insensitive substrings against the real `raga` field of the
 * site's own events — so every session plays an actual recording, photo
 * set, and link already in the archive, never invented content.
 *
 * This is offered in that same spirit — a devotional listening practice,
 * not a clinical claim — and the player UI carries an explicit Beta
 * label and disclaimer alongside it.
 */

export const DURATIONS_MIN = [5, 10, 15, 20, 25, 30];

export const AILMENTS = [
  {
    key: "headache",
    label: "Headache & Mental Fatigue",
    blurb: "To ease head tension and quiet a racing mind",
    icon: "HeadIcon",
    keywords: ["bhairav", "todi", "malkauns", "bageshree"],
  },
  {
    key: "knee",
    label: "Knee & Joint Pain",
    blurb: "To soothe stiffness in the knees, joints, and body",
    icon: "JointIcon",
    keywords: ["kedar", "hindol", "darbari", "shree", "des"],
  },
  {
    key: "insomnia",
    label: "Insomnia & Restless Sleep",
    blurb: "To settle the mind for deep, restful sleep",
    icon: "MoonIcon",
    keywords: ["darbari", "bageshree", "malkauns", "nayaki kanada"],
  },
  {
    key: "stress",
    label: "Stress & Anxiety",
    blurb: "To release everyday tension and overwhelm",
    icon: "LeafIcon",
    keywords: ["bhupali", "yaman", "kalyani", "kalyan", "sarang"],
  },
  {
    key: "fatigue",
    label: "Fatigue & Low Energy",
    blurb: "To renew vitality when energy runs low",
    icon: "BoltIcon",
    keywords: ["bhairav", "bilawal", "tilak kamod", "hamsadhwani"],
  },
  {
    key: "heartache",
    label: "Heartache & Emotional Balance",
    blurb: "To find comfort through grief and emotional strain",
    icon: "HeartIcon",
    keywords: ["yaman", "shivaranjani", "charukeshi", "anandabhairavi", "kafi"],
  },
];

function normalize(str) {
  return (str || "").toLowerCase();
}

export function eventMatchesAilment(event, ailment) {
  const ragaStr = normalize(event?.raga);
  if (!ragaStr) return false;
  return ailment.keywords.some((kw) => ragaStr.includes(kw));
}

/**
 * Which platforms this Beta player can reliably fade out at the end of a
 * session. Direct audio/video files and YouTube all expose a volume
 * control we can ramp down; Vimeo/SoundCloud/Spotify embeds don't offer
 * that through a public, key-less API, so a Beta session doesn't pick
 * those as its primary track (existing event pages still play them
 * normally elsewhere on the site).
 */
export function detectPlayablePlatform(url) {
  if (!url || typeof url !== "string") return "unknown";
  if (/(?:youtube(?:-nocookie)?\.com|youtu\.be)/i.test(url)) return "youtube";
  if (/\.(mp4|webm|mov|m4v)(?=$|[?#])/i.test(url)) return "video";
  if (/\.(mp3|wav|ogg|m4a|aac)(?=$|[?#])/i.test(url)) return "audio";
  return "unknown";
}

export function findAilmentEvents(events, ailment) {
  if (!events || events.length === 0) return [];
  return events.filter(
    (e) => e && e.audioUrl && detectPlayablePlatform(e.audioUrl) !== "unknown" && eventMatchesAilment(e, ailment)
  );
}

/**
 * Pick the single best event to soundtrack a given ailment's session:
 * prefer a match that also has photographs, since those become the
 * session's scenic backdrop.
 */
export function pickPrimaryEvent(events, ailment) {
  const matches = findAilmentEvents(events, ailment);
  if (matches.length === 0) return null;
  const withImages = matches.find((e) => Array.isArray(e.images) && e.images.length > 0);
  return withImages || matches[0];
}

/**
 * Build the full Beta roster: every ailment paired with its best real
 * event (or null if the live data has no fadeable match yet — the
 * ailment still shows in the UI, marked "coming soon").
 */
export function buildAilmentPrograms(events) {
  return AILMENTS.map((ailment) => {
    const matches = findAilmentEvents(events, ailment);
    const primaryEvent = pickPrimaryEvent(events, ailment);
    return { ...ailment, primaryEvent, matchCount: matches.length };
  });
}
