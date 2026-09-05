import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { color, font, radius, shadow, zIndex } from "./theme";
import { CloseIcon, OmDivider } from "./icons";

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(3, 3, 8, 0.78)",
    backdropFilter: "blur(6px)",
    zIndex: zIndex.infoModal,
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
    background: color.surfaceStrong,
    border: `1px solid ${color.surfaceBorder}`,
    boxShadow: shadow.panel,
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "relative",
    color: color.textPrimary,
    fontFamily: font.body,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 26px 14px",
  },
  title: {
    fontFamily: font.display,
    fontSize: "clamp(21px, 2.4vw, 28px)",
    fontWeight: "500",
    margin: 0,
    color: color.gold,
    lineHeight: 1.15,
  },
  closeButton: {
    border: `1px solid ${color.surfaceBorderSoft}`,
    background: color.goldFaint,
    color: color.gold,
    borderRadius: radius.pill,
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  body: {
    padding: "0 26px 26px",
    maxHeight: "78vh",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
            transition={{ duration: 0.26, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.header}>
              <h2 style={styles.title}>{title}</h2>
              <button type="button" style={styles.closeButton} onClick={onClose} aria-label="Close">
                <CloseIcon size={16} />
              </button>
            </div>
            <div style={{ padding: "0 26px" }}>
              <OmDivider size={16} style={{ margin: "0 0 6px" }} />
            </div>
            <div style={styles.body}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
