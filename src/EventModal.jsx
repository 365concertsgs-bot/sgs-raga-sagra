import React, { useEffect, useRef, useCallback, Suspense, lazy, memo } from "react";
import { motion } from "framer-motion";
import { color, font, radius, shadow, zIndex } from "./theme";
import {
  CloseIcon,
  PinIcon,
  CityIcon,
  CalendarIcon,
  HashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  OmDivider,
} from "./icons";

// Lazy load media players to split vendor code
const AudioPlayer = lazy(() => import("./AudioPlayer.jsx"));
const YouTubePlayer = lazy(() => import("./YouTubePlayer.jsx"));

const isYouTubeLink = (url) =>
  typeof url === "string" && /(?:youtu\.be|youtube\.com|youtube-nocookie\.com)/i.test(url);

const AUTO_ADVANCE_MS = 6000;

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: zIndex.modal,
    background:
      "radial-gradient(ellipse at 50% 20%, rgba(28, 22, 51, 0.92) 0%, rgba(5, 6, 12, 0.97) 60%, rgba(3, 3, 7, 0.99) 100%)",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
    display: "flex",
    justifyContent: "center",
  },
  shell: {
    width: "100%",
    maxWidth: "980px",
    margin: "0 auto",
    color: color.textPrimary,
    fontFamily: font.body,
    paddingBottom: "clamp(24px, 5vh, 56px)",
  },
  closeButton: {
    position: "sticky",
    top: "16px",
    marginLeft: "auto",
    marginRight: "clamp(12px, 3vw, 24px)",
    zIndex: 5,
    background: "rgba(5, 6, 12, 0.65)",
    color: color.gold,
    border: `1px solid ${color.surfaceBorder}`,
    borderRadius: radius.pill,
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    boxShadow: shadow.panelSoft,
  },
  heroWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    maxHeight: "58vh",
    overflow: "hidden",
    background: "#000",
    borderBottom: `1px solid ${color.surfaceBorderSoft}`,
  },
  heroTrack: {
    display: "flex",
    width: "100%",
    height: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
  },
  heroSlide: {
    flex: "0 0 100%",
    width: "100%",
    height: "100%",
    scrollSnapAlign: "start",
    position: "relative",
    overflow: "hidden",
    background: "#050508",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  heroGradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(5,6,12,0.15) 0%, rgba(5,6,12,0.05) 35%, rgba(5,6,12,0.85) 100%)",
    pointerEvents: "none",
  },
  heroCaption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "clamp(16px, 4vw, 34px) clamp(18px, 4vw, 40px)",
    pointerEvents: "none",
  },
  eyebrow: {
    fontFamily: font.body,
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: color.marigold,
    fontWeight: 700,
    marginBottom: "8px",
  },
  eventName: {
    fontFamily: font.display,
    fontSize: "clamp(22px, 4vw, 38px)",
    lineHeight: 1.12,
    color: color.textPrimary,
    margin: 0,
    textShadow: "0 4px 24px rgba(0,0,0,0.6)",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "40px",
    height: "40px",
    borderRadius: radius.pill,
    background: "rgba(5, 6, 12, 0.55)",
    border: `1px solid ${color.surfaceBorderSoft}`,
    color: color.gold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
  },
  dots: {
    position: "absolute",
    bottom: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "6px",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: color.goldDim,
  },
  body: {
    padding: "clamp(18px, 4vw, 34px)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px 22px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13.5px",
    color: color.textMuted,
  },
  metaIcon: {
    color: color.gold,
    opacity: 0.9,
  },
  panel: {
    background: color.surface,
    border: `1px solid ${color.surfaceBorderSoft}`,
    borderRadius: radius.md,
    padding: "16px 18px",
    boxShadow: shadow.panelSoft,
  },
  panelTitle: {
    fontFamily: font.display,
    color: color.gold,
    fontSize: "16px",
    letterSpacing: "0.02em",
    margin: "0 0 10px 0",
  },
  descriptionScroll: {
    maxHeight: "min(38vh, 320px)",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    paddingRight: "6px",
  },
  descList: {
    margin: 0,
    paddingLeft: "18px",
    color: color.textPrimary,
    fontSize: "14px",
    lineHeight: 1.75,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  ragasLabel: {
    fontFamily: font.display,
    color: color.marigoldBright,
    fontSize: "15px",
    display: "block",
    marginTop: "6px",
    marginBottom: "4px",
  },
  mediaFrame: {
    borderRadius: radius.md,
    overflow: "hidden",
    border: `1px solid ${color.surfaceBorderSoft}`,
    boxShadow: shadow.panel,
    background: "#000",
  },
  footnote: {
    marginTop: "10px",
    padding: "10px 14px",
    background: color.goldFaint,
    borderLeft: `3px solid ${color.goldDim}`,
    color: color.textMuted,
    fontSize: "12.5px",
    borderRadius: "6px",
  },
};

function cleanDescriptionLine(line) {
  return line
    .trim()
    .replace(/^[-•*]\s*/, "")
    .replace(/[^\w\s.,;:\-–—'""()[\]&]/g, "")
    .replace(/–|—/g, "-")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .trim();
}

const EventGallery = memo(function EventGallery({
  images,
  eventName,
  carouselRef,
  currentSlideIndex,
  setCurrentSlideIndex,
}) {
  const isSyncingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      const el = carouselRef?.current;
      if (!el || !images || images.length === 0) return;
      const clamped = ((index % images.length) + images.length) % images.length;
      isSyncingRef.current = true;
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
      setCurrentSlideIndex(clamped);
      window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isSyncingRef.current = false;
      }, 500);
    },
    [carouselRef, images, setCurrentSlideIndex]
  );

  // Keep the scroll position in sync when currentSlideIndex changes from
  // outside (auto-advance timer in the parent).
  useEffect(() => {
    const el = carouselRef?.current;
    if (!el || isSyncingRef.current) return;
    const target = currentSlideIndex * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 4) {
      el.scrollTo({ left: target, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlideIndex]);

  const handleScroll = useCallback(() => {
    const el = carouselRef?.current;
    if (!el || !images || images.length === 0) return;
    const index = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    if (index !== currentSlideIndex) {
      setCurrentSlideIndex(Math.min(index, images.length - 1));
    }
  }, [carouselRef, images, currentSlideIndex, setCurrentSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!images || images.length === 0) return;
      if (e.key === "ArrowLeft") goTo(currentSlideIndex - 1);
      else if (e.key === "ArrowRight") goTo(currentSlideIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images, currentSlideIndex, goTo]);

  if (!images || images.length === 0) {
    return (
      <div style={styles.heroWrap}>
        <div style={styles.noImage}>
          <ImageIcon size={30} />
          <span style={{ fontSize: "13px" }}>No photographs available for this event yet</span>
        </div>
        <div style={styles.heroGradient} />
        <div style={styles.heroCaption}>
          <div style={styles.eyebrow}>Music for Healing &amp; Meditation</div>
          <h2 style={styles.eventName}>{eventName}</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.heroWrap}>
      <div style={styles.heroTrack} ref={carouselRef} onScroll={handleScroll}>
        {images.map((src, idx) => (
          <div key={`${src}-${idx}`} style={styles.heroSlide}>
            <img
              src={src}
              alt={`${eventName || "Event"} — photograph ${idx + 1}`}
              style={{
                ...styles.heroImg,
                animation: `kenburns${idx % 2 === 0 ? "In" : "Out"} 9s ease-in-out infinite alternate`,
              }}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              onError={(e) => {
                e.target.style.opacity = 0.15;
              }}
            />
          </div>
        ))}
      </div>
      <div style={styles.heroGradient} />
      <div style={styles.heroCaption}>
        <div style={styles.eyebrow}>Music for Healing &amp; Meditation</div>
        <h2 style={styles.eventName}>{eventName}</h2>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photograph"
            onClick={() => goTo(currentSlideIndex - 1)}
            style={{ ...styles.navArrow, left: "12px" }}
          >
            <ChevronLeftIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Next photograph"
            onClick={() => goTo(currentSlideIndex + 1)}
            style={{ ...styles.navArrow, right: "12px" }}
          >
            <ChevronRightIcon size={18} />
          </button>
          <div style={styles.dots}>
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to photograph ${idx + 1}`}
                onClick={() => goTo(idx)}
                style={{
                  ...styles.dot,
                  background: idx === currentSlideIndex ? color.gold : "rgba(255,255,255,0.35)",
                  width: idx === currentSlideIndex ? "18px" : "7px",
                  borderRadius: idx === currentSlideIndex ? "4px" : "50%",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

function EventMeta({ event }) {
  const dateLabel = event.date
    ? new Date(event.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  const items = [
    event.place || event.location ? { icon: PinIcon, label: event.place || event.location } : null,
    event.city ? { icon: CityIcon, label: event.city } : null,
    dateLabel ? { icon: CalendarIcon, label: dateLabel } : null,
    event.eventNumber ? { icon: HashIcon, label: `Event ${event.eventNumber} of 365` } : null,
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div style={styles.metaRow}>
      {items.map(({ icon: Icon, label }, idx) => (
        <div key={idx} style={styles.metaItem}>
          <Icon size={15} style={styles.metaIcon} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function EventDescription({ description }) {
  if (!description) return null;

  const lines = description.split("\n").filter((line) => line.trim());

  return (
    <div style={styles.panel}>
      <h3 style={styles.panelTitle}>About this offering</h3>
      <div style={styles.descriptionScroll}>
        <ul style={styles.descList}>
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            const cleaned = cleanDescriptionLine(line);

            if (trimmed.toLowerCase().includes("ragas played")) {
              return (
                <React.Fragment key={idx}>
                  <OmDivider size={16} />
                  <strong style={styles.ragasLabel}>{cleaned}</strong>
                </React.Fragment>
              );
            }

            return (
              <li key={idx} style={{ listStyle: lines.length > 1 ? "disc" : "none", marginLeft: lines.length > 1 ? "2px" : "-18px" }}>
                {cleaned}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function EventMedia({ event }) {
  if (!event.audioUrl) return null;

  return (
    <div>
      <div style={styles.mediaFrame}>
        <Suspense fallback={<div style={{ padding: "24px", color: color.textMuted, fontSize: "13px" }}>Loading media…</div>}>
          {isYouTubeLink(event.audioUrl) ? (
            <YouTubePlayer videoUrl={event.audioUrl} title={event.eventName || "Event video"} />
          ) : (
            <AudioPlayer audioUrl={event.audioUrl} autoPlay muted={false} />
          )}
        </Suspense>
      </div>
      {event.placeholder && <div style={styles.footnote}>{String(event.placeholder)}</div>}
    </div>
  );
}

export default memo(function EventModal({ event, onClose, carouselRef, currentSlideIndex, setCurrentSlideIndex }) {
  if (!event) return null;

  // Reset to the first photograph whenever a different event is opened.
  useEffect(() => {
    setCurrentSlideIndex(0);
    const el = carouselRef?.current;
    if (el) el.scrollLeft = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.eventNumber, event.eventName]);

  // Stop any playing audio elements when the modal closes.
  useEffect(() => {
    return () => {
      document.querySelectorAll("audio").forEach((audio) => {
        audio.pause();
      });
    };
  }, []);

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
        @keyframes kenburnsIn { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes kenburnsOut { from { transform: scale(1.08); } to { transform: scale(1); } }
      `}</style>
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.32, ease: "easeOut", delay: 0.05 }}
        style={styles.shell}
      >
        <button type="button" onClick={onClose} style={styles.closeButton} aria-label="Close event details">
          <CloseIcon size={18} />
        </button>

        <EventGallery
          images={event.images}
          eventName={event.eventName}
          carouselRef={carouselRef}
          currentSlideIndex={currentSlideIndex}
          setCurrentSlideIndex={setCurrentSlideIndex}
        />

        <div style={styles.body}>
          <EventMeta event={event} />
          <EventDescription description={event.description} />
          <EventMedia event={event} />
        </div>
      </motion.div>
    </motion.div>
  );
});
