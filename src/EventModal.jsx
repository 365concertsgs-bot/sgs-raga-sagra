import React, { useEffect, useRef, useState, Suspense, lazy, memo } from "react";
import { motion } from "framer-motion";

// Lazy load media players to split vendor code
const AudioPlayer = lazy(() => import("./AudioPlayer.jsx"));
const YouTubePlayer = lazy(() => import("./YouTubePlayer.jsx"));

const isYouTubeLink = (url) =>
  typeof url === "string" && /(?:youtu\.be|youtube\.com|youtube-nocookie\.com)/i.test(url);

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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },
  imageGallery: {
    marginBottom: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  mainImage: {
    width: "100%",
    maxWidth: "600px",
    height: "auto",
    maxHeight: "55vh",
    objectFit: "contain",
    borderRadius: "8px",
    border: "2px solid rgba(255, 215, 0, 0.3)",
    display: "block",
    pointerEvents: "none",
    cursor: "default",
    userSelect: "none",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  imageControls: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexWrap: "wrap",
  },
  navButton: {
    background: "rgba(255, 215, 0, 0.2)",
    color: "#ffd700",
    border: "1px solid #ffd700",
    borderRadius: "4px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    fontWeight: "bold",
  },
  imageCounter: {
    color: "#ffd700",
    fontSize: "14px",
    minWidth: "120px",
    textAlign: "center",
  },
  imageLoadingError: {
    color: "#ff6b6b",
    fontSize: "12px",
    textAlign: "center",
    padding: "10px",
    background: "rgba(255, 107, 107, 0.1)",
    borderRadius: "4px",
  },
};

export default memo(function EventModal({ event, onClose, carouselRef, currentSlideIndex, setCurrentSlideIndex }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const imageIndexRef = useRef(0);

  if (!event) return null;

  // Log when event changes (for debugging)
  useEffect(() => {
    setImageIndex(0);
    setImageLoadError(false);
    if (event.images && event.images.length > 0) {
      console.log(`Event "${event.eventName}" has ${event.images.length} image(s):`, event.images);
    } else {
      console.warn(`Event "${event.eventName}" has no images`);
    }
  }, [event]);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    if (!event.images || event.images.length === 0) return;

    let mounted = true;
    const interval = setInterval(() => {
      const current = imageIndexRef.current;
      const next = current === event.images.length - 1 ? 0 : current + 1;
      const nextUrl = event.images[next];
      // Preload next image to avoid blinking
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        setImageLoadError(false);
        imageIndexRef.current = next;
        setImageLoaded(false);
        // small timeout to allow opacity transition out/in
        setTimeout(() => {
          setImageIndex(next);
        }, 10);
      };
      img.onerror = () => {
        if (!mounted) return;
        console.warn(`Preload failed for image: ${nextUrl}`);
        imageIndexRef.current = next;
        setImageIndex(next);
      };
      img.src = nextUrl;
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [event.images]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!event.images || event.images.length === 0) return;

      if (e.key === "ArrowLeft") {
        setImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event.images]);


  useEffect(() => {
    imageIndexRef.current = imageIndex;
  }, [imageIndex]);

  const handleImageError = () => {
    console.error(`Failed to load image: ${event.images[imageIndex]}`);
    setImageLoadError(true);
  };

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
            <strong style={{ color: "#ffd700" }}>#️⃣ Event Number</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.eventNumber}</p>
          </div>
        </div>

        {/* Image Gallery - Auto-Rotating Single Image */}
        {event.images && event.images.length > 0 && (
          <div style={styles.imageGallery}>
            {imageLoadError ? (
              <div style={styles.imageLoadingError}>
                ⚠️ Failed to load image. Image URL might be invalid.
              </div>
            ) : (
              <img
                key={`${event.eventNumber}-${imageIndex}`}
                src={event.images[imageIndex]}
                alt={`${event.eventName} ${imageIndex + 1}`}
                style={{...styles.mainImage, transition: 'opacity 600ms ease-in-out', opacity: imageLoaded ? 1 : 0}}
                onError={handleImageError}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                decoding="async"
              />
            )}
            
            {/* Image Navigation Controls */}
            <div style={styles.imageControls}>
              <div style={styles.imageCounter}>
                Image {imageIndex + 1} / {event.images.length}
              </div>
            </div>
          </div>
        )}

        {/* No Images Message */}
        {(!event.images || event.images.length === 0) && (
          <div style={{
            padding: "15px",
            background: "rgba(255, 215, 0, 0.1)",
            borderRadius: "8px",
            border: "1px dashed rgba(255, 215, 0, 0.3)",
            color: "#ffd700",
            textAlign: "center",
            marginBottom: "8px",
            fontSize: "12px",
          }}>
            📷 No images available for this event
          </div>
        )}

        {/* Description with improved scrolling */}
        {event.description && (
          <div style={{ marginBottom: "8px", maxHeight: "200px", overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "10px", background: "rgba(255, 215, 0, 0.1)", borderRadius: "8px", border: "2px solid rgba(255, 215, 0, 0.3)" }}>
            <strong style={{ color: "#ffd700", display: "block", marginBottom: "6px", fontSize: "14px" }}>Description</strong>
            <ul style={{ margin: "0", paddingLeft: "16px", lineHeight: "1.6", color: "#fff", fontSize: "12px" }}>
              {event.description.split('\n').filter(line => line.trim()).map((line, idx) => {
                const trimmedLine = line.trim();
                const cleanedLine = trimmedLine
                  .replace(/^[-•*]\s*/, '')
                  .replace(/[^\w\s.,;:\-–—'""()\[\]&]/g, '')
                  .replace(/–|—/g, '-')
                  .replace(/['']/g, "'")
                  .replace(/[""]/g, '"')
                  .trim();
                
                // Check if this line is "Ragas Played" - render as subtitle
                if (trimmedLine.toLowerCase().includes('ragas played')) {
                  return (
                    <div key={idx} style={{ marginBottom: "8px", marginTop: "8px" }}>
                      <strong style={{ color: "#ffd700", display: "block", fontSize: "13px", marginBottom: "4px" }}>
                        {cleanedLine}
                      </strong>
                    </div>
                  );
                }
                
                return (
                  <li key={idx} style={{ marginBottom: "3px" }}>
                    {cleanedLine}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Audio/Video Player with optional footnote */}
        {event.audioUrl && (
          <div style={{ marginBottom: "0", marginTop: "8px", padding: "0", background: "transparent", borderRadius: "0", border: "none", overflow: "hidden", marginLeft: "-20px", marginRight: "-20px", width: "calc(100% + 40px)" }}>
            <div style={{ position: "relative" }}>
              <Suspense fallback={<p>Loading media...</p>}>
                {isYouTubeLink(event.audioUrl) ? (
                  <YouTubePlayer videoUrl={event.audioUrl} title={event.eventName || "Event video"} />
                ) : (
                  <AudioPlayer audioUrl={event.audioUrl} autoPlay={true} muted={false} />
                )}
              </Suspense>

              {/* Superscript footnote indicator next to media when placeholder exists */}
              {event.placeholder && (
                <span style={{ position: "absolute", top: "8px", right: "12px", background: "rgba(0,0,0,0.6)", color: "#ffd700", padding: "4px 6px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>1</span>
              )}
            </div>

            {/* Footnote text shown below the media */}
            {event.placeholder && (
              <div style={{ marginTop: "8px", padding: "8px 12px", background: "rgba(255, 215, 0, 0.06)", borderLeft: "4px solid rgba(255, 215, 0, 0.3)", color: "#fff", fontSize: "12px", borderRadius: "4px" }}>
                <strong style={{ color: "#ffd700", marginRight: "6px" }}>1.</strong>
                <span>{String(event.placeholder)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});
