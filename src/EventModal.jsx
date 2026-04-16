import React, { useEffect, useRef, useState, Suspense, lazy, memo } from "react";
import { motion } from "framer-motion";

// Lazy load AudioPlayer to split vendor code
const AudioPlayer = lazy(() => import("./AudioPlayer.jsx"));

const styles = {
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.95)",
    zIndex: 50,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "0",
    display: "flex",
    justifyContent: "center",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
  },
  modalContent: {
    width: "100%",
    maxWidth: "1000px",
    color: "#fff",
    overflowY: "visible",
    WebkitOverflowScrolling: "touch",
    padding: "20px",
    margin: "0 auto",
  },
  modalHeader: {
    flexShrink: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid rgba(255, 215, 0, 0.3)",
  },
  closeButton: {
    background: "rgba(255, 215, 0, 0.2)",
    color: "#ffd700",
    border: "1px solid #ffd700",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s ease",
  },
  eventDetails: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "8px",
    flexGrow: 1,
  },
  detailItem: {
    background: "rgba(255, 215, 0, 0.1)",
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid rgba(255, 215, 0, 0.2)",
    fontSize: "12px",
  },
  imageGallery: {
    marginBottom: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  mainImage: {
    width: "100%",
    maxWidth: "600px",
    height: "auto",
    maxHeight: "350px",
    objectFit: "contain",
    borderRadius: "8px",
    border: "2px solid rgba(255, 215, 0, 0.3)",
    display: "block",
  },
  imageControls: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  imageCounter: {
    color: "#ffd700",
    fontSize: "14px",
    minWidth: "100px",
    textAlign: "center",
  },
};

export default memo(function EventModal({ event, onClose, carouselRef, currentSlideIndex, setCurrentSlideIndex }) {
  const [imageIndex, setImageIndex] = useState(0);

  if (!event) return null;

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    if (!event.images || event.images.length === 0) return;

    const interval = setInterval(() => {
      setImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [event.images]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      style={styles.modal}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{...styles.modalContent, paddingBottom: "10px"}}>
        {/* Header */}
        <div style={{...styles.modalHeader, marginBottom: "10px", paddingBottom: "8px"}}>
          <div>
            <h2 style={{ margin: 0, fontSize: "clamp(18px, 3vw, 24px)", color: "#ffd700" }}>
              {event.eventName}
            </h2>
            <p style={{ color: "#ffd700", margin: "5px 0 0 0", fontSize: "12px" }}>
              Event #{event.eventNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{...styles.closeButton}}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 215, 0, 0.3)";
              e.target.style.boxShadow = "0 0 10px rgba(255, 215, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 215, 0, 0.2)";
              e.target.style.boxShadow = "none";
            }}
          >
            ✕
          </button>
        </div>

        {/* Event Details */}
        <div style={styles.eventDetails}>
          <div style={styles.detailItem}>
            <strong style={{ color: "#ffd700" }}>📍 Location</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.place || event.location || "Unknown"}</p>
          </div>
          <div style={styles.detailItem}>
            <strong style={{ color: "#ffd700" }}>🏙️ City</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.city || "Unknown"}</p>
          </div>
          <div style={styles.detailItem}>
            <strong style={{ color: "#ffd700" }}>📅 Date</strong>
            <p style={{ margin: "5px 0 0 0" }}>
              {event.date 
                ? new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : "Unknown"}
            </p>
          </div>
          <div style={styles.detailItem}>
            <strong style={{ color: "#ffd700" }}>📆 Year</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.year || "Unknown"}</p>
          </div>
          <div style={styles.detailItem}>
            <strong style={{ color: "#ffd700" }}>#️⃣ Event Number</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.eventNumber}</p>
          </div>
        </div>

        {/* Image Gallery - Auto-Rotating Single Image */}
        {event.images && event.images.length > 0 && (
          <div style={styles.imageGallery}>
            <img
              src={event.images[imageIndex]}
              alt={`${event.eventName} ${imageIndex + 1}`}
              style={styles.mainImage}
              onError={(e) => { e.target.src = ""; }}
            />
            <div style={styles.imageCounter}>
              Image {imageIndex + 1} / {event.images.length}
            </div>
          </div>
        )}

        {/* Description with improved scrolling */}
        {event.description && (
          <div style={{ marginBottom: "8px", maxHeight: "200px", overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "10px", background: "rgba(255, 215, 0, 0.1)", borderRadius: "8px", border: "2px solid rgba(255, 215, 0, 0.3)" }}>
            <strong style={{ color: "#ffd700", display: "block", marginBottom: "6px", fontSize: "14px" }}>Description</strong>
            <ul style={{ margin: "0", paddingLeft: "16px", lineHeight: "1.6", color: "#fff", fontSize: "12px" }}>
              {event.description.split('\n').filter(line => line.trim()).map((line, idx) => {
                const cleanedLine = line
                  .trim()
                  .replace(/^[-•*]\s*/, '')
                  .replace(/[^\w\s.,;:\-–—'""()\[\]&]/g, '')
                  .replace(/–|—/g, '-')
                  .replace(/['']/g, "'")
                  .replace(/[""]/g, '"')
                  .trim();
                return (
                  <li key={idx} style={{ marginBottom: "3px" }}>
                    {cleanedLine}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Audio/Video Player */}
        {event.audioUrl && (
          <div style={{ marginBottom: "0", marginTop: "8px", padding: "0", background: "transparent", borderRadius: "0", border: "none", overflow: "hidden", marginLeft: "-20px", marginRight: "-20px", width: "calc(100% + 40px)" }}>
            <Suspense fallback={<p>Loading media...</p>}>
              <AudioPlayer audioUrl={event.audioUrl} autoPlay={true} muted={false} />
            </Suspense>
          </div>
        )}
      </div>
    </motion.div>
  );
});
