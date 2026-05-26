import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.72)",
    backdropFilter: "blur(4px)",
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  },
  panel: {
    width: "100%",
    maxWidth: "820px",
    background: "rgba(6, 8, 17, 0.98)",
    border: "1px solid rgba(255, 215, 0, 0.22)",
    boxShadow: "0 22px 70px rgba(0, 0, 0, 0.65)",
    borderRadius: "24px",
    overflow: "hidden",
    position: "relative",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "22px 24px 16px",
    borderBottom: "1px solid rgba(255, 215, 0, 0.16)",
  },
  title: {
    fontSize: "clamp(20px, 2vw, 26px)",
    fontWeight: "700",
    margin: 0,
    color: "#ffd700",
    lineHeight: 1.1,
  },
  closeButton: {
    border: "none",
    background: "rgba(255, 215, 0, 0.14)",
    color: "#ffd700",
    borderRadius: "14px",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "700",
    minWidth: "44px",
    lineHeight: 1,
  },
  body: {
    padding: "18px 24px 24px",
    maxHeight: "80vh",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  question: {
    fontSize: "clamp(16px, 1.4vw, 20px)",
    fontWeight: "700",
    color: "#ffd700",
    margin: 0,
    lineHeight: 1.3,
  },
  insightLabel: {
    fontSize: "12px",
    letterSpacing: "0.2em",
    color: "rgba(255, 215, 0, 0.85)",
    textTransform: "uppercase",
  },
  insight: {
    fontSize: "clamp(13px, 1.2vw, 16px)",
    color: "#f7f2e7",
    lineHeight: 1.75,
    margin: 0,
  },
};

export default function InfoModal({ title, isOpen, onClose, children }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === backdropRef.current) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          ref={backdropRef}
          style={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            style={styles.panel}
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.header}>
              <h2 style={styles.title}>{title}</h2>
              <button
                type="button"
                style={styles.closeButton}
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <div style={styles.body}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
