import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";

// Lazy load AudioPlayer to split vendor code
const AudioPlayer = lazy(() => Promise.resolve({
  default: ({ audioUrl, autoPlay = false }) => {
    const [error, setError] = useState(null);
    const [loaded, setLoaded] = useState(false);

    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    };

    const getPlatformType = (url) => {
      if (url.includes('vimeo.com') || url.includes('vimeopro.com')) return 'vimeo';
      if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
      if (url.includes('spotify.com')) return 'spotify';
      if (url.includes('soundcloud.com')) return 'soundcloud';
      if (url.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) return 'audio';
      return 'unknown';
    };

    const getYoutubeVideoId = (url) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    };

    const getVimeoVideoId = (url) => {
      const match = url.match(/(?:vimeo\.com\/(?:video\/)?|vimeopro\.com\/.+\/video\/)(\d+)/);
      return match ? match[1] : null;
    };

    if (!audioUrl || audioUrl.trim() === "") {
      return <p style={{ color: '#ff6b6b' }}>No media available</p>;
    }

    if (!isValidUrl(audioUrl)) {
      return <p style={{ color: '#ff6b6b' }}>Invalid media link</p>;
    }

    const platform = getPlatformType(audioUrl);

    if (platform === 'vimeo') {
      const vimeoId = getVimeoVideoId(audioUrl);
      if (!vimeoId) return <p style={{ color: '#ff6b6b' }}>Invalid Vimeo link</p>;
      return (
        <div style={{ width: "100%", marginTop: "10px" }}>
          <iframe
            loading="lazy"
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&playsinline=1`}
            style={{ width: "100%", height: "300px", border: "none", borderRadius: "6px" }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    if (platform === 'youtube') {
      const youtubeId = getYoutubeVideoId(audioUrl);
      if (!youtubeId) return <p style={{ color: '#ff6b6b' }}>Invalid YouTube link</p>;
      return (
        <div style={{ width: "100%", marginTop: "10px" }}>
          <iframe
            loading="lazy"
            width="100%"
            height="300"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}`}
            style={{ borderRadius: "6px", border: "none" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    if (platform === 'spotify') {
      return (
        <div style={{ width: "100%", marginTop: "10px" }}>
          <iframe
            loading="lazy"
            title="Spotify"
            src={audioUrl.replace('open.spotify.com', 'open.spotify.com/embed')}
            width="100%"
            height="300"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen"
            style={{ borderRadius: "6px" }}
          ></iframe>
        </div>
      );
    }

    if (platform === 'soundcloud') {
      return (
        <div style={{ width: "100%", marginTop: "10px" }}>
          <iframe
            loading="lazy"
            title="SoundCloud"
            width="100%"
            height="300"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(audioUrl)}&color=%23ffd700&auto_play=${autoPlay ? 'true' : 'false'}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`}
            style={{ borderRadius: "6px" }}
          ></iframe>
        </div>
      );
    }

    return <p style={{ color: '#ff6b6b' }}>Unsupported media format</p>;
  }
}));

const styles = {
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.95)",
    zIndex: 50,
    overflowY: "auto",
    padding: "clamp(20px, 5vw, 40px)",
    display: "flex",
    justifyContent: "center",
  },
  modalContent: {
    width: "clamp(320px, 90vw, 900px)",
    color: "#fff",
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

export default function EventModal({ event, onClose, carouselRef, currentSlideIndex, setCurrentSlideIndex }) {
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
            <strong style={{ color: "#ffd700" }}>🗓️ Year</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.year}</p>
          </div>
          <div style={styles.detailItem}>
            <strong style={{ color: "#ffd700" }}>#️⃣ Event Number</strong>
            <p style={{ margin: "5px 0 0 0" }}>{event.eventNumber}</p>
          </div>
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

        {/* Description */}
        {event.description && (
          <div style={{ marginBottom: "20px", maxHeight: "200px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <strong style={{ color: "#ffd700" }}>📝 Description</strong>
            <p style={{ margin: "10px 0" }}>{event.description}</p>
          </div>
        )}

        {/* Audio/Video Player */}
        {event.audioUrl && (
          <div style={{ marginBottom: "20px" }}>
            <Suspense fallback={<p>Loading media...</p>}>
              <AudioPlayer audioUrl={event.audioUrl} autoPlay={true} />
            </Suspense>
          </div>
        )}
      </div>
    </motion.div>
  );
}
