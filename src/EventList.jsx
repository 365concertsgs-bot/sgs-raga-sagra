import React, { useMemo, useState } from "react";
import { color, font, radius, shadow, zIndex } from "./theme";
import { CalendarIcon, PinIcon, CityIcon, HashIcon, StarIcon, MusicIcon } from "./icons";

const SORT_OPTIONS = [
  { key: "date", label: "Date" },
  { key: "no", label: "Event #" },
  { key: "name", label: "Name" },
];

/**
 * A themed, sortable card grid of events — an alternative to the globe for
 * browsing the same filteredEvents data. Clicking a card opens the same
 * EventModal used from the globe (via onSelectEvent), so there is exactly
 * one place that owns "what an event looks like in detail".
 */
export default function EventList({ events, onSelectEvent, isFavorite, toggleFavorite, leftInset }) {
  const [sortKey, setSortKey] = useState("date");

  const sorted = useMemo(() => {
    const list = [...events];
    list.sort((a, b) => {
      if (sortKey === "no") return (a.no ?? 0) - (b.no ?? 0);
      if (sortKey === "name") return (a.eventName || "").localeCompare(b.eventName || "");
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db);
    });
    return list;
  }, [events, sortKey]);

  return (
    <div style={{ ...styles.wrap, ...(leftInset ? { paddingLeft: leftInset } : null) }}>
      <div style={styles.header}>
        <div style={styles.count}>
          {events.length} event{events.length === 1 ? "" : "s"}
        </div>
        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>Sort by</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortKey(opt.key)}
              style={{
                ...styles.sortButton,
                ...(sortKey === opt.key ? styles.sortButtonActive : null),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.grid}>
        {sorted.map((event) => (
          <button
            key={event.no ?? event.eventNumber ?? event.eventName}
            type="button"
            style={styles.card}
            onClick={() => onSelectEvent(event)}
          >
            <div style={styles.thumbWrap}>
              {event.images && event.images[0] ? (
                <img src={event.images[0]} alt="" style={styles.thumb} loading="lazy" />
              ) : (
                <div style={styles.thumbFallback}>
                  <MusicIcon size={26} />
                </div>
              )}
              {toggleFavorite && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isFavorite?.(event.eventNumber) ? "Remove from favorites" : "Add to favorites"
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
                  <StarIcon size={16} filled={isFavorite?.(event.eventNumber)} />
                </span>
              )}
            </div>

            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>{event.eventName || "Untitled Event"}</div>
              <div style={styles.metaRow}>
                {event.place && (
                  <span style={styles.metaItem}>
                    <PinIcon size={13} />
                    {event.place}
                  </span>
                )}
                {event.city && (
                  <span style={styles.metaItem}>
                    <CityIcon size={13} />
                    {event.city}
                  </span>
                )}
              </div>
              <div style={styles.metaRow}>
                {event.date && (
                  <span style={styles.metaItem}>
                    <CalendarIcon size={13} />
                    {event.date}
                  </span>
                )}
                {event.no != null && (
                  <span style={styles.metaItem}>
                    <HashIcon size={13} />
                    {event.no}
                  </span>
                )}
              </div>
              {event.raga && <div style={styles.ragaTag}>{event.raga}</div>}
            </div>
          </button>
        ))}

        {sorted.length === 0 && (
          <div style={styles.empty}>No events match the current filters.</div>
        )}
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
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
    maxWidth: "1100px",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  count: {
    color: color.textMuted,
    fontFamily: font.body,
    fontSize: "13px",
  },
  sortRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sortLabel: {
    color: color.textFaint,
    fontFamily: font.body,
    fontSize: "12px",
    marginRight: "2px",
  },
  sortButton: {
    background: "rgba(11,9,22,0.6)",
    border: `1px solid ${color.surfaceBorderSoft}`,
    color: color.textMuted,
    borderRadius: radius.pill,
    padding: "6px 14px",
    fontSize: "12px",
    fontFamily: font.body,
  },
  sortButtonActive: {
    background: `linear-gradient(135deg, ${color.gold}, ${color.marigold})`,
    color: "#1a1206",
    borderColor: "transparent",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "16px",
    maxWidth: "1100px",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    background: color.surface,
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.md,
    overflow: "hidden",
    cursor: "pointer",
    padding: 0,
    boxShadow: shadow.panelSoft,
  },
  thumbWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 10",
    background: "rgba(0,0,0,0.4)",
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
  favoriteBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "rgba(8,6,17,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color.gold,
    cursor: "pointer",
  },
  cardBody: {
    padding: "12px 14px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  cardTitle: {
    color: color.textPrimary,
    fontFamily: font.display,
    fontSize: "15px",
    lineHeight: 1.3,
  },
  metaRow: {
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
    fontSize: "11.5px",
  },
  ragaTag: {
    marginTop: "2px",
    alignSelf: "flex-start",
    background: color.goldFaint,
    color: color.gold,
    fontFamily: font.body,
    fontSize: "10.5px",
    padding: "3px 9px",
    borderRadius: radius.pill,
  },
  empty: {
    color: color.textFaint,
    fontFamily: font.body,
    fontSize: "14px",
    padding: "40px 0",
    textAlign: "center",
    gridColumn: "1 / -1",
  },
};
