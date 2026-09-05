import React from "react";
import { color, font, radius, shadow, zIndex } from "./theme";
import { SparkleIcon, MusicIcon, ChevronRightIcon } from "./icons";

/**
 * A small, inviting "just added" spotlight on the globe view. The data has
 * no created-at timestamp, so "recently added" is inferred from the event
 * number — the archive is numbered in the order events were catalogued, so
 * the highest numbers are the newest additions to the atlas (not necessarily
 * the most recent concert dates).
 */
export default function RecentEvents({ events, onSelectEvent }) {
  if (!events || events.length === 0) return null;

  return (
    <div style={styles.wrap} data-recent-events>
      <style>{`
        @keyframes recentGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(242, 193, 78, 0.4), ${shadow.panelSoft}; }
          50% { box-shadow: 0 0 0 7px rgba(242, 193, 78, 0), ${shadow.panelSoft}; }
        }
        @keyframes recentBadgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>

      <div style={styles.heading}>
        <SparkleIcon size={14} />
        <span>Newly Added to the Atlas</span>
      </div>

      <div style={styles.row}>
        {events.map((event, idx) => (
          <button
            key={event.eventNumber ?? event.no ?? event.eventName}
            type="button"
            style={{ ...styles.card, animationDelay: `${idx * 0.15}s` }}
            onClick={() => onSelectEvent(event)}
            title={event.eventName || "Untitled Event"}
          >
            <span style={styles.newBadge}>NEW</span>
            <div style={styles.thumbWrap}>
              {event.images && event.images[0] ? (
                <img src={event.images[0]} alt="" style={styles.thumb} loading="lazy" />
              ) : (
                <div style={styles.thumbFallback}>
                  <MusicIcon size={20} />
                </div>
              )}
              <div style={styles.thumbGradient} />
              <div style={styles.cardTitle}>{event.eventName || "Untitled Event"}</div>
            </div>
            <div style={styles.cta}>
              Explore <ChevronRightIcon size={11} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "absolute",
    bottom: "clamp(14px, 3vh, 26px)",
    left: 0,
    right: 0,
    margin: "0 auto",
    width: "min(94vw, 940px)",
    zIndex: zIndex.chrome,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    // Empty space around the row lets globe drag/zoom pass through; the
    // row itself re-enables pointer events for its clickable cards.
    pointerEvents: "none",
  },
  heading: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: color.marigoldBright,
    fontFamily: font.body,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    textShadow: "0 2px 12px rgba(0,0,0,0.75)",
  },
  row: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    maxWidth: "100%",
    padding: "4px 2px 8px",
    pointerEvents: "auto",
  },
  card: {
    position: "relative",
    flex: "0 0 auto",
    width: "130px",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    background: "rgba(11, 9, 22, 0.85)",
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.md,
    overflow: "hidden",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    animation: "recentGlow 2.8s ease-in-out infinite",
    padding: 0,
  },
  newBadge: {
    position: "absolute",
    top: "6px",
    left: "6px",
    zIndex: 2,
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    color: "#1a1206",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    padding: "2px 6px",
    borderRadius: radius.pill,
    animation: "recentBadgePulse 1.8s ease-in-out infinite",
  },
  thumbWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "4 / 3",
    background: "rgba(0,0,0,0.5)",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  thumbFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color.goldDim,
  },
  thumbGradient: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(5,6,12,0) 42%, rgba(5,6,12,0.94) 100%)",
  },
  cardTitle: {
    position: "absolute",
    left: "8px",
    right: "8px",
    bottom: "6px",
    color: color.textPrimary,
    fontFamily: font.display,
    fontSize: "11px",
    lineHeight: 1.25,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  cta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: "6px 4px",
    fontSize: "9.5px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: color.gold,
    background: "rgba(242, 193, 78, 0.1)",
  },
};
