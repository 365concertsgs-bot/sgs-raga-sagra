import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { color, font, radius, shadow, zIndex } from "./theme";
import {
  CloseIcon,
  PlayCircleIcon,
  SparkleIcon,
  OmDivider,
  HeadIcon,
  JointIcon,
  MoonIcon,
  LeafIcon,
  BoltIcon,
  HeartIcon,
} from "./icons";
import { buildAilmentPrograms, detectPlayablePlatform, DURATIONS_MIN } from "./healingAilments";

/**
 * Guided Healing & Meditation (Beta)
 *
 * A dedicated, full-screen session player: pick an ailment and a
 * duration, and a real recording from the archive — matched to that
 * ailment through its traditional raga associations — plays over a
 * slow, scenic backdrop (the event's own photographs when it has them,
 * otherwise a quiet generated nature scene) until the chosen time is
 * up, fading out gently rather than cutting off.
 *
 * Beta scope: ~6 ailments, and only tracks whose platform this player
 * can actually fade (direct audio/video files and YouTube) are eligible
 * — see healingAilments.js.
 */

const ICONS = { HeadIcon, JointIcon, MoonIcon, LeafIcon, BoltIcon, HeartIcon };

const YT_ID_PATTERNS = [
  /(?:youtube(?:-nocookie)?\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/i,
  /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/i,
  /(?:youtube(?:-nocookie)?\.com\/embed\/)([A-Za-z0-9_-]{11})/i,
  /(?:youtube(?:-nocookie)?\.com\/shorts\/)([A-Za-z0-9_-]{11})/i,
];

function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  for (const pattern of YT_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  try {
    return new URL(url).searchParams.get("v");
  } catch (e) {
    return null;
  }
}

function getFadeSeconds(totalSec) {
  return Math.max(8, Math.min(20, Math.round(totalSec * 0.08)));
}

function formatClock(totalSec) {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

let ytApiPromise = null;
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") previousCallback();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

export default function GuidedHealing({ events, onClose }) {
  const programs = useMemo(() => buildAilmentPrograms(events), [events]);

  const [ailmentKey, setAilmentKey] = useState(null);
  const [durationMin, setDurationMin] = useState(10);
  const [phase, setPhase] = useState("select"); // select | session | complete
  const [elapsedSec, setElapsedSec] = useState(0);
  const [starting, setStarting] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  const ytContainerId = useRef(`gh-yt-${Math.random().toString(36).slice(2)}`).current;
  const ytPlayerRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const platformRef = useRef("unknown");
  const tickRef = useRef(null);
  const totalSecRef = useRef(0);
  const fadeSecRef = useRef(0);

  const selectedProgram = programs.find((p) => p.key === ailmentKey) || null;
  const canBegin = Boolean(selectedProgram && selectedProgram.primaryEvent && durationMin);

  const getActiveEl = useCallback(() => {
    return platformRef.current === "video" ? videoRef.current : audioRef.current;
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const teardownPlayers = useCallback(() => {
    clearTick();
    [audioRef.current, videoRef.current].forEach((el) => {
      if (!el) return;
      try {
        el.onended = null;
        el.pause();
        el.removeAttribute("src");
        el.load();
      } catch (e) {
        /* ignore */
      }
    });
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.stopVideo();
        ytPlayerRef.current.destroy();
      } catch (e) {
        /* ignore */
      }
      ytPlayerRef.current = null;
    }
  }, [clearTick]);

  useEffect(() => () => teardownPlayers(), [teardownPlayers]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const applyVolume = useCallback(
    (v) => {
      const vol = Math.max(0, Math.min(1, v));
      if (platformRef.current === "youtube" && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.setVolume(Math.round(vol * 100));
        } catch (e) {
          /* ignore */
        }
      } else {
        const el = getActiveEl();
        if (el) el.volume = vol;
      }
    },
    [getActiveEl]
  );

  const finishSession = useCallback(() => {
    teardownPlayers();
    setPhase("complete");
  }, [teardownPlayers]);

  const beginTicking = useCallback(() => {
    const total = totalSecRef.current;
    const fade = fadeSecRef.current;
    const startedAt = Date.now();
    clearTick();
    tickRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setElapsedSec(elapsed);
      if (elapsed >= total) {
        finishSession();
        return;
      }
      const fadeStart = total - fade;
      if (elapsed >= fadeStart) {
        applyVolume(1 - (elapsed - fadeStart) / fade);
      }
    }, 250);
  }, [applyVolume, clearTick, finishSession]);

  const beginSession = useCallback(async () => {
    if (!selectedProgram || !selectedProgram.primaryEvent || !durationMin) return;
    setPlaybackError(null);
    setStarting(true);

    const url = selectedProgram.primaryEvent.audioUrl;
    const platform = detectPlayablePlatform(url);
    platformRef.current = platform;
    totalSecRef.current = durationMin * 60;
    fadeSecRef.current = getFadeSeconds(totalSecRef.current);
    setElapsedSec(0);

    try {
      if (platform === "youtube") {
        const videoId = extractYouTubeId(url);
        if (!videoId) throw new Error("Could not read this YouTube link");
        const YT = await loadYouTubeApi();
        if (!YT || !YT.Player) throw new Error("YouTube player unavailable");

        await new Promise((resolve) => {
          // The IFrame API replaces the target element with a brand-new
          // <iframe> of its own (ignoring the placeholder div's CSS), so the
          // hidden sizing has to be requested here and re-applied to the
          // real iframe once it exists — otherwise YouTube's 640×390
          // default would show up as a visible rectangle over the scenery.
          ytPlayerRef.current = new YT.Player(ytContainerId, {
            width: "2",
            height: "2",
            videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
            },
            events: {
              onReady: (e) => {
                try {
                  const iframe = e.target.getIframe();
                  if (iframe) {
                    iframe.style.position = "absolute";
                    iframe.style.width = "2px";
                    iframe.style.height = "2px";
                    iframe.style.opacity = "0";
                    iframe.style.pointerEvents = "none";
                  }
                } catch (err) {
                  /* ignore */
                }
                e.target.setVolume(100);
                e.target.playVideo();
                resolve();
              },
              onStateChange: (e) => {
                if (e.data === YT.PlayerState.ENDED && tickRef.current) {
                  e.target.seekTo(0);
                  e.target.playVideo();
                }
              },
              onError: () => resolve(),
            },
          });
        });
      } else {
        const el = platform === "video" ? videoRef.current : audioRef.current;
        if (!el) throw new Error("Player not ready");
        el.src = url;
        el.volume = 1;
        el.onended = () => {
          if (tickRef.current) {
            el.currentTime = 0;
            el.play().catch(() => {});
          }
        };
        await el.play();
      }

      setPhase("session");
      beginTicking();
    } catch (err) {
      console.warn("Guided Healing: could not start playback", err);
      setPlaybackError("This track couldn't start playing. Please try another ailment.");
      teardownPlayers();
    } finally {
      setStarting(false);
    }
  }, [selectedProgram, durationMin, ytContainerId, beginTicking, teardownPlayers]);

  const endSessionEarly = useCallback(() => {
    teardownPlayers();
    setPhase("select");
  }, [teardownPlayers]);

  const chooseAnother = useCallback(() => {
    setPhase("select");
    setAilmentKey(null);
    setElapsedSec(0);
    setPlaybackError(null);
  }, []);

  const heroImages = (selectedProgram?.primaryEvent?.images || []).filter(Boolean);
  const totalSec = durationMin * 60;
  const remainingSec = Math.max(0, totalSec - elapsedSec);
  const progressPct = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={styles.overlay}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes ghKenburns { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes ghFirefly { 0%, 100% { opacity: 0.12; transform: translateY(0); } 50% { opacity: 0.65; transform: translateY(-16px); } }
        @keyframes ghSkyDrift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @media (max-width: 760px) {
          .gh-main-row { flex-direction: column !important; }
          .gh-side-panel { width: 100% !important; max-width: 100% !important; border-left: none !important; border-top: 1px solid ${color.surfaceBorderSoft}; }
          .gh-stage { min-height: 220px !important; }
        }
      `}</style>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.32, ease: "easeOut", delay: 0.05 }}
        style={styles.shell}
      >
        <div style={styles.headerRow}>
          <div style={styles.headerTitleGroup}>
            <SparkleIcon size={16} style={{ color: color.marigoldBright, flexShrink: 0 }} />
            <span style={styles.headerTitle}>Guided Healing &amp; Meditation</span>
            <span style={styles.betaPill}>BETA</span>
          </div>
          <button type="button" onClick={onClose} style={styles.closeButton} aria-label="Close guided healing">
            <CloseIcon size={18} />
          </button>
        </div>

        <div style={styles.mainRow} className="gh-main-row">
          <div style={styles.stage} className="gh-stage">
            <div id={ytContainerId} style={styles.hiddenYt} />
            <audio ref={audioRef} style={{ display: "none" }} playsInline />
            <video ref={videoRef} style={{ display: "none" }} playsInline />

            {heroImages.length > 0 ? (
              <div style={styles.stageBackdrop}>
                {heroImages.slice(0, 3).map((src, idx) => (
                  <img
                    key={src + idx}
                    src={src}
                    alt=""
                    style={{
                      ...styles.stageImg,
                      opacity: idx === 0 ? 1 : 0.55,
                      animation: `ghKenburns ${18 + idx * 4}s ease-in-out infinite alternate`,
                      animationDelay: `${idx * 1.4}s`,
                      zIndex: heroImages.length - idx,
                    }}
                  />
                ))}
                <div style={styles.stageGradient} />
              </div>
            ) : (
              <div style={styles.natureScene}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      ...styles.firefly,
                      left: `${(i * 8.3 + 4) % 100}%`,
                      top: `${18 + ((i * 53) % 60)}%`,
                      animationDelay: `${(i % 6) * 0.7}s`,
                      animationDuration: `${4 + (i % 4)}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <div style={styles.stageContent}>
              {phase === "select" && (
                <div style={styles.stageIdle}>
                  <OmDivider size={26} />
                  <p style={styles.stagePrompt}>
                    {selectedProgram
                      ? selectedProgram.blurb
                      : "Choose what you'd like to ease, and how long you have, to begin."}
                  </p>
                </div>
              )}

              {(phase === "session" || phase === "complete") && selectedProgram && (
                <div style={styles.sessionInfo}>
                  <div style={styles.sessionLabel}>{selectedProgram.label}</div>
                  {selectedProgram.primaryEvent?.raga && (
                    <div style={styles.sessionRaga}>Raga: {selectedProgram.primaryEvent.raga}</div>
                  )}
                </div>
              )}

              {phase === "session" && (
                <div style={styles.timerWrap}>
                  <div style={styles.timerTrack}>
                    <div style={{ ...styles.timerFill, width: `${progressPct}%` }} />
                  </div>
                  <div style={styles.timerLabel}>{formatClock(remainingSec)} remaining</div>
                  <button type="button" style={styles.endButton} onClick={endSessionEarly}>
                    End Session
                  </button>
                </div>
              )}

              {phase === "complete" && (
                <div style={styles.completeWrap}>
                  <p style={styles.completeText}>Your session is complete. Jaya Guru Datta! 🕉</p>
                  <div style={styles.completeActions}>
                    <button type="button" style={styles.primaryButton} onClick={chooseAnother}>
                      Choose Another
                    </button>
                    <button type="button" style={styles.secondaryButton} onClick={onClose}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {phase === "select" && (
            <div style={styles.sidePanel} className="gh-side-panel">
              <div style={styles.sideSection}>
                <div style={styles.sideStepLabel}>1. What would you like to ease?</div>
                <div style={styles.ailmentGrid}>
                  {programs.map((p) => {
                    const Icon = ICONS[p.icon] || SparkleIcon;
                    const available = Boolean(p.primaryEvent);
                    const active = ailmentKey === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          setAilmentKey(p.key);
                          setPlaybackError(null);
                        }}
                        style={{
                          ...styles.ailmentCard,
                          ...(active ? styles.ailmentCardActive : null),
                          ...(!available ? styles.ailmentCardDisabled : null),
                        }}
                        title={available ? p.blurb : "Coming soon — no matching recording yet"}
                      >
                        <Icon size={17} style={{ color: active ? "#1a1206" : color.gold, flexShrink: 0 }} />
                        <span style={styles.ailmentLabel}>{p.label}</span>
                        {!available && <span style={styles.comingSoon}>Coming soon</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.sideSection}>
                <div style={styles.sideStepLabel}>2. Choose your duration</div>
                <div style={styles.durationRow}>
                  {DURATIONS_MIN.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDurationMin(min)}
                      style={{
                        ...styles.durationChip,
                        ...(durationMin === min ? styles.durationChipActive : null),
                      }}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={!canBegin || starting}
                onClick={beginSession}
                style={{
                  ...styles.beginButton,
                  ...(!canBegin || starting ? styles.beginButtonDisabled : null),
                }}
              >
                <PlayCircleIcon size={18} />
                {starting ? "Starting…" : "Begin Session"}
              </button>

              {playbackError && <p style={styles.errorText}>{playbackError}</p>}

              <p style={styles.disclaimer}>
                Offered in the spirit of Nada Chikitsa &amp; Raga Ragini Vidya — a traditional,
                devotional listening practice, not a substitute for medical care.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: zIndex.healingModal,
    background: "rgba(3, 3, 7, 0.88)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(10px, 3vw, 28px)",
  },
  shell: {
    width: "100%",
    maxWidth: "1080px",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    background: color.surfaceStrong,
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.lg,
    boxShadow: shadow.panel,
    overflow: "hidden",
    color: color.textPrimary,
    fontFamily: font.body,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: `1px solid ${color.surfaceBorderSoft}`,
    flexShrink: 0,
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: font.display,
    fontSize: "clamp(15px, 2.4vw, 19px)",
    color: color.gold,
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  betaPill: {
    fontFamily: font.body,
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#1a1206",
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    borderRadius: radius.pill,
    padding: "3px 8px",
    flexShrink: 0,
  },
  closeButton: {
    background: "rgba(5, 6, 12, 0.65)",
    color: color.gold,
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.pill,
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  mainRow: {
    display: "flex",
    flex: "1 1 auto",
    minHeight: 0,
  },
  stage: {
    position: "relative",
    flex: "1 1 auto",
    minWidth: 0,
    minHeight: "360px",
    overflow: "hidden",
    background: "#050508",
    display: "flex",
    alignItems: "flex-end",
  },
  hiddenYt: {
    position: "absolute",
    width: "2px",
    height: "2px",
    opacity: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  stageBackdrop: {
    position: "absolute",
    inset: 0,
  },
  stageImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  stageGradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(5,6,12,0.35) 0%, rgba(5,6,12,0.15) 40%, rgba(5,6,12,0.92) 100%)",
    zIndex: 10,
  },
  natureScene: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, #0d2b1c 0%, #163a24 22%, #1c1633 55%, #0d0a1c 80%, #05060c 100%)",
    backgroundSize: "220% 220%",
    animation: "ghSkyDrift 22s ease-in-out infinite",
  },
  firefly: {
    position: "absolute",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: color.gold,
    boxShadow: `0 0 8px 2px ${color.goldDim}`,
    animation: "ghFirefly 5s ease-in-out infinite",
  },
  stageContent: {
    position: "relative",
    zIndex: 20,
    width: "100%",
    padding: "clamp(16px, 4vw, 36px)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  stageIdle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
    padding: "20px 0",
  },
  stagePrompt: {
    margin: 0,
    color: color.textMuted,
    fontSize: "14px",
    maxWidth: "440px",
    lineHeight: 1.6,
  },
  sessionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  sessionLabel: {
    fontFamily: font.display,
    fontSize: "clamp(18px, 3vw, 26px)",
    color: color.textPrimary,
    textShadow: "0 4px 20px rgba(0,0,0,0.6)",
  },
  sessionRaga: {
    fontSize: "13px",
    color: color.marigoldBright,
    letterSpacing: "0.03em",
  },
  timerWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  timerTrack: {
    width: "100%",
    height: "5px",
    borderRadius: radius.pill,
    background: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${color.gold}, ${color.marigold})`,
    transition: "width 0.3s linear",
  },
  timerLabel: {
    fontSize: "12.5px",
    color: color.textMuted,
  },
  endButton: {
    alignSelf: "flex-start",
    background: "rgba(5, 6, 12, 0.65)",
    color: color.textPrimary,
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.pill,
    padding: "8px 16px",
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: "pointer",
  },
  completeWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  completeText: {
    margin: 0,
    fontFamily: font.display,
    fontSize: "clamp(16px, 2.6vw, 21px)",
    color: color.gold,
  },
  completeActions: {
    display: "flex",
    gap: "10px",
  },
  primaryButton: {
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    color: "#1a1206",
    border: "none",
    borderRadius: radius.pill,
    padding: "10px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "rgba(5, 6, 12, 0.65)",
    color: color.textPrimary,
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.pill,
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
  sidePanel: {
    width: "min(340px, 38vw)",
    maxWidth: "340px",
    flexShrink: 0,
    borderLeft: `1px solid ${color.surfaceBorderSoft}`,
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    overflowY: "auto",
    background: "rgba(5, 6, 12, 0.4)",
  },
  sideSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sideStepLabel: {
    fontFamily: font.body,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: color.marigoldBright,
  },
  ailmentGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  ailmentCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textAlign: "left",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${color.surfaceBorderSoft}`,
    borderRadius: radius.sm,
    padding: "9px 12px",
    cursor: "pointer",
    color: color.textPrimary,
  },
  ailmentCardActive: {
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    color: "#1a1206",
    borderColor: "transparent",
  },
  ailmentCardDisabled: {
    opacity: 0.42,
    cursor: "not-allowed",
  },
  ailmentLabel: {
    fontSize: "13px",
    fontWeight: 600,
    flex: 1,
    minWidth: 0,
  },
  comingSoon: {
    fontSize: "9.5px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: color.textFaint,
    flexShrink: 0,
  },
  durationRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },
  durationChip: {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${color.surfaceBorderSoft}`,
    borderRadius: radius.pill,
    color: color.textPrimary,
    fontSize: "12.5px",
    fontWeight: 600,
    padding: "7px 13px",
    cursor: "pointer",
  },
  durationChipActive: {
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    color: "#1a1206",
    borderColor: "transparent",
  },
  beginButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    color: "#1a1206",
    border: "none",
    borderRadius: radius.pill,
    padding: "12px 18px",
    fontWeight: 800,
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: shadow.glowGold,
  },
  beginButtonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  errorText: {
    margin: 0,
    fontSize: "12px",
    color: color.danger,
  },
  disclaimer: {
    margin: 0,
    fontSize: "11px",
    lineHeight: 1.55,
    color: color.textFaint,
    fontStyle: "italic",
  },
};
