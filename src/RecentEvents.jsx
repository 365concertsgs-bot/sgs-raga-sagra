import React from "react";
import { color, font, radius, shadow, zIndex } from "./theme";
import { SparkleIcon, MusicIcon, ChevronRightIcon } from "./icons";

/**
 * A small, inviting "just added" spotlight on the globe view. The data has
 * no created-at timestamp, so "recently added" is inferred from the event
 * number — the archive is numbered in the order events were catalogued, so
 * the highest numbers are the newest additions to the atlas (not necessarily
 * the most recent concert dates).
 *
 * Deliberately compact: a slim vertical rail down the right edge rather than
 * a wide banner, so it reads as a quiet invitation rather than competing
 * with the globe for attention.
 */
export default function RecentEvents({ events, onSelectEvent }) {
  if (!events || events.length === 0) return null;

  return (
    <div style={styles.wrap} data-recent-events>
      <style>{`
        @keyframes recentGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(242, 193, 78, 0.35), ${shadow.panelSoft}; }
          50% { box-shadow: 0 0 0 5px rgba(242, 193, 78, 0), ${shadow.panelSoft}; }
        }
      `}</style>

      <div style={styles.heading}>
        <SparkleIcon size={12} />
        <span>New</span>
      </div>

      <div style={styles.column}>
        {events.map((event, idx) => (
          <button
            key={event.eventNumber ?? event.no ?? event.eventName}
            type="button"
            style={{ ...styles.card, animationDelay: `${idx * 0.15}s` }}
            onClick={() => onSelectEvent(event)}
            title={event.eventName || "Untitled Event"}
          >
            <div style={styles.thumbWrap}>
              {event.images && event.images[0] ? (
                <img src={event.images[0]} alt="" style={styles.thumb} loading="lazy" />
              ) : (
                <div style={styles.thumbFallback}>
                  <MusicIcon size={13} />
                </div>
              )}
            </div>
            <div style={styles.cardTitle}>{event.eventName || "Untitled Event"}</div>
            <ChevronRightIcon size={12} style={styles.chevron} />
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "absolute",
    top: "clamp(150px, 22vh, 200px)",
    right: "clamp(15px, 3vw, 25px)",
    zIndex: zIndex.chrome,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    width: "clamp(150px, 15vw, 190px)",
    maxHeight: "calc(100vh - 260px)",
  },
  heading: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: color.marigoldBright,
    fontFamily: font.body,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    textShadow: "0 2px 10px rgba(0,0,0,0.75)",
    paddingRight: "2px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
    overflowY: "auto",
  },
  card: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    textAlign: "left",
    background: "rgba(11, 9, 22, 0.82)",
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.sm,
    overflow: "hidden",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    animation: "recentGlow 3s ease-in-out infinite",
    padding: "5px",
  },
  thumbWrap: {
    flexShrink: 0,
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    overflow: "hidden",
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
  cardTitle: {
    flex: 1,
    minWidth: 0,
    color: color.textPrimary,
    fontFamily: font.body,
    fontSize: "10.5px",
    lineHeight: 1.25,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chevron: {
    flexShrink: 0,
    color: color.gold,
    opacity: 0.8,
  },
};
