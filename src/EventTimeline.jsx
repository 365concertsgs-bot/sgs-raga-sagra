import React, { useMemo } from "react";
import { color, font, radius, shadow, zIndex } from "./theme";
import { CalendarIcon, PinIcon, HashIcon, StarIcon, MusicIcon } from "./icons";

/**
 * Chronological view of the same filteredEvents data, grouped by year along
 * a vertical line — a different lens on the same underlying Supabase rows,
 * not a separate data source.
 */
export default function EventTimeline({ events, onSelectEvent, isFavorite, toggleFavorite, leftInset }) {
  const groups = useMemo(() => {
    const byYear = new Map();
    events.forEach((event) => {
      const key = event.year || "Undated";
      if (!byYear.has(key)) byYear.set(key, []);
      byYear.get(key).push(event);
    });

    const sortedKeys = Array.from(byYear.keys()).sort((a, b) => {
      if (a === "Undated") return 1;
      if (b === "Undated") return -1;
      return a - b;
    });

    return sortedKeys.map((year) => {
      const list = [...byYear.get(year)].sort((a, b) => (a.no ?? 0) - (b.no ?? 0));
      return { year, events: list };
    });
  }, [events]);

  return (
    <div style={{ ...styles.wrap, ...(leftInset ? { paddingLeft: leftInset } : null) }}>
      <div style={styles.header}>
        <div style={styles.count}>
          {events.length} event{events.length === 1 ? "" : "s"} across {groups.length} year
          {groups.length === 1 ? "" : "s"}
        </div>
      </div>

      <div style={styles.timeline}>
        <div style={styles.spine} />

        {groups.map((group) => (
          <div key={group.year} style={styles.yearSection}>
            <div style={styles.yearMarker}>
              <span style={styles.yearDot} />
              <span style={styles.yearLabel}>{group.year}</span>
            </div>

            <div style={styles.eventsForYear}>
              {group.events.map((event) => (
                <button
                  key={event.no ?? event.eventNumber ?? event.eventName}
                  type="button"
                  style={styles.row}
                  onClick={() => onSelectEvent(event)}
                >
                  <div style={styles.rowThumbWrap}>
                    {event.images && event.images[0] ? (
                      <img src={event.images[0]} alt="" style={styles.rowThumb} loading="lazy" />
                    ) : (
                      <div style={styles.rowThumbFallback}>
                        <MusicIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div style={styles.rowBody}>
                    <div style={styles.rowTitle}>{event.eventName || "Untitled Event"}</div>
                    <div style={styles.rowMeta}>
                      {event.place && (
                        <span style={styles.metaItem}>
                          <PinIcon size={12} />
                          {event.place}
                        </span>
                      )}
                      {event.date && (
                        <span style={styles.metaItem}>
                          <CalendarIcon size={12} />
                          {event.date}
                        </span>
                      )}
                      {event.no != null && (
                        <span style={styles.metaItem}>
                          <HashIcon size={12} />
                          {event.no}
                        </span>
                      )}
                    </div>
                    {event.raga && <div style={styles.ragaTag}>{event.raga}</div>}
                  </div>

                  {toggleFavorite && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={
                        isFavorite?.(event.eventNumber)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      style={styles.favoriteBadge}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(event.eventNumber);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(event.eventNumber);
                        }
                      }}
                    >
                      <StarIcon size={15} filled={isFavorite?.(event.eventNumber)} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && <div style={styles.empty}>No events match the current filters.</div>}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "absolute",
    inset: 0,
    zIndex: zIndex.contentView,
    display: "flex",
    flexDirection: "column",
    paddingTop: "clamp(150px, 22vh, 210px)",
    paddingBottom: "24px",
    paddingLeft: "clamp(16px, 4vw, 48px)",
    paddingRight: "clamp(16px, 4vw, 48px)",
    overflowY: "auto",
    background: color.bgRadial,
  },
  header: {
    maxWidth: "780px",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "18px",
  },
  count: {
    color: color.textMuted,
    fontFamily: font.body,
    fontSize: "13px",
  },
  timeline: {
    position: "relative",
    maxWidth: "780px",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "26px",
  },
  spine: {
    position: "absolute",
    left: "6px",
    top: "6px",
    bottom: "6px",
    width: "2px",
    background:
      "linear-gradient(180deg, rgba(242,193,78,0.55), rgba(242,193,78,0.12))",
  },
  yearSection: {
    position: "relative",
    marginBottom: "28px",
  },
  yearMarker: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  yearDot: {
    position: "absolute",
    left: "-26px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    boxShadow: shadow.glowGold,
  },
  yearLabel: {
    color: color.textPrimary,
    fontFamily: font.display,
    fontSize: "20px",
  },
  eventsForYear: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: color.surface,
    border: `1px solid ${color.surfaceBorderSoft}`,
    borderRadius: radius.md,
    padding: "10px 12px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: shadow.panelSoft,
  },
  rowThumbWrap: {
    flexShrink: 0,
    width: "56px",
    height: "56px",
    borderRadius: radius.sm,
    overflow: "hidden",
    background: "rgba(0,0,0,0.4)",
  },
  rowThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  rowThumbFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color.goldDim,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  rowTitle: {
    color: color.textPrimary,
    fontFamily: font.display,
    fontSize: "14.5px",
    lineHeight: 1.3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    color: color.textMuted,
    fontFamily: font.body,
    fontSize: "11px",
  },
  ragaTag: {
    alignSelf: "flex-start",
    background: color.goldFaint,
    color: color.gold,
    fontFamily: font.body,
    fontSize: "10px",
    padding: "2px 8px",
    borderRadius: radius.pill,
  },
  favoriteBadge: {
    flexShrink: 0,
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "rgba(8,6,17,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color.gold,
    cursor: "pointer",
  },
  empty: {
    color: color.textFaint,
    fontFamily: font.body,
    fontSize: "14px",
    padding: "40px 0",
    textAlign: "center",
  },
};
