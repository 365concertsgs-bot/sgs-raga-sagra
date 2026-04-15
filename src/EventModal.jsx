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
    overflowY: "hidden",
    overflowX: "hidden",
    padding: "clamp(20px, 5vw, 40px)",
    display: "flex",
    justifyContent: "center",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
  },
  modalContent: {
    width: "clamp(320px, 90vw, 900px)",
    color: "#fff",
    maxHeight: "100vh",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
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
    gap: "20px",
    marginBottom: "20px",
    flexGrow: 1,
  },
  detailItem: {
    background: "rgba(255, 215, 0, 0.1)",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid rgba(255, 215, 0, 0.2)",
  },
  carousel: {
    display: "flex",
    overflowX: "auto",
    gap: "10px",
    marginBottom: "20px",
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
  },
  carouselImage: {
    minWidth: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default memo(function EventModal({ event, onClose, carouselRef, currentSlideIndex, setCurrentSlideIndex }) {
  if (!event) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      style={styles.modal}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={styles.modalContent}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: "clamp(18px, 3vw, 24px)", color: "#ffd700" }}>
              {event.eventName}
            </h2>
            <p style={{ color: "#ffd700", margin: "5px 0 0 0", fontSize: "12px" }}>
              Event #{event.eventNumber} • {event.year}
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
            <p style={{ margin: "5px 0 0 0" }}>{event.year}</p>
          </div>
          <div style={styles.detailItem}>
            <strong style={{ color: "#ffd700" }}>#️⃣ Event Number</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.eventNumber}</p>
          </div>
          {event.raga && (
            <div style={styles.detailItem}>
              <strong style={{ color: "#ffd700" }}>🎵 Raga</strong>
              <p style={{ margin: "5px 0 0 0" }}>{event.raga}</p>
            </div>
          )}
        </div>

        {/* Image Carousel */}
        {event.images && event.images.length > 0 && (
          <>
            <div style={styles.carousel} ref={carouselRef}>
              {event.images.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`${event.eventName} ${idx + 1}`}
                  style={styles.carouselImage}
                  onError={(e) => { e.target.src = ""; }}
                />
              ))}
            </div>
            <div style={{ textAlign: "center", color: "#ffd700", marginBottom: "20px" }}>
              Image {currentSlideIndex + 1} of {event.images.length}
            </div>
          </>
        )}

        {/* Description with improved scrolling */}
        {event.description && (
          <div style={{ marginBottom: "20px", maxHeight: "300px", overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "15px", background: "rgba(255, 215, 0, 0.1)", borderRadius: "8px", border: "2px solid rgba(255, 215, 0, 0.3)" }}>
            <strong style={{ color: "#ffd700", display: "block", marginBottom: "12px", fontSize: "16px" }}>📝 Description</strong>
            <p style={{ margin: "0", lineHeight: "1.8", color: "#fff", fontSize: "14px" }}>{event.description}</p>
          </div>
        )}

        {/* Audio/Video Player */}
        {event.audioUrl && (
          <div style={{ marginBottom: "20px" }}>
            <Suspense fallback={<p>Loading media...</p>}>
              <AudioPlayer audioUrl={event.audioUrl} autoPlay={true} muted={false} />
            </Suspense>
          </div>
        )}
      </div>
    </motion.div>
  );
});
