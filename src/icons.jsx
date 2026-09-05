import React from "react";

/**
 * Small hand-authored inline-SVG icon set, replacing emoji throughout the
 * app. Zero-dependency (no icon package) to protect the bundle-size budget.
 * All icons are single-color and inherit currentColor so they pick up
 * whatever gold/marigold tone the caller sets.
 */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 18, style, children, viewBox = "0 0 24 24" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const CloseIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const PinIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" {...base} />
  </Svg>
);

export const CityIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M4 21V9l6-4 6 4v12M14 21V13h4v8M8 21v-4M8 13h.01M11 13h.01M8 9h.01M11 9h.01" />
  </Svg>
);

export const CalendarIcon = (props) => (
  <Svg {...props}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" {...base} />
    <path {...base} d="M7 3v4M17 3v4M3.5 10h17" />
  </Svg>
);

export const HashIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M9 3 7 21M17 3l-2 18M4 8.5h16M3.5 15.5h16" />
  </Svg>
);

export const ImageIcon = (props) => (
  <Svg {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" {...base} />
    <circle cx="9" cy="10" r="1.6" {...base} />
    <path {...base} d="m4.5 17.5 4.7-4.7a1.7 1.7 0 0 1 2.4 0l1.9 1.9M14 15l1.7-1.7a1.7 1.7 0 0 1 2.4 0l1.4 1.4" />
  </Svg>
);

export const MusicIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M9 18V5.5L20 3v12.5" />
    <circle cx="6.5" cy="18" r="2.5" {...base} />
    <circle cx="17.5" cy="15.5" r="2.5" {...base} />
  </Svg>
);

export const ExternalLinkIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M14 4h6v6M20 4 10 14M8 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V16" />
  </Svg>
);

export const ChevronLeftIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M15 5 8 12l7 7" />
  </Svg>
);

export const ChevronRightIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="m9 5 7 7-7 7" />
  </Svg>
);

export const InfoIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" {...base} />
    <path {...base} d="M12 10.5v6M12 7.6h.01" />
  </Svg>
);

export const SparkleIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
    <path {...base} d="M19 15l.8 2.1L22 18l-2.2.9-.8 2.1-.8-2.1L16 18l2.2-.9.8-2.1Z" />
  </Svg>
);

export const StoreIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M4 9.5 5.2 4h13.6L20 9.5M4 9.5a2.3 2.3 0 0 0 4.4 1M4 9.5a2.3 2.3 0 0 0 4.6 0M8.4 10.5a2.3 2.3 0 0 0 4.6 0M13 10.5a2.3 2.3 0 0 0 4.6 0M17.6 10.5A2.3 2.3 0 0 0 20 9.5M5 11v9h14v-9" />
  </Svg>
);

export const PlayCircleIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" {...base} />
    <path {...base} d="M10 8.7v6.6l5.5-3.3-5.5-3.3Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const RefreshIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 3v5h-5" />
    <path {...base} d="M20 12a8 8 0 0 1-13.7 5.7L4 16M4 21v-5h5" />
  </Svg>
);

export const WarningIcon = (props) => (
  <Svg {...props}>
    <path {...base} d="M12 3.5 21.5 20h-19L12 3.5Z" />
    <path {...base} d="M12 9.5v4.2M12 17h.01" />
  </Svg>
);

export const VideoIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="6" width="13" height="12" rx="2" {...base} />
    <path {...base} d="m16 10 5-2.6v9.2L16 14" />
  </Svg>
);

export const GlobeIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" {...base} />
    <path {...base} d="M3.5 12h17M12 3.5c2.6 2.3 4 5.3 4 8.5s-1.4 6.2-4 8.5c-2.6-2.3-4-5.3-4-8.5s1.4-6.2 4-8.5Z" />
  </Svg>
);

export const OmIcon = (props) => (
  <Svg {...props} viewBox="0 0 32 32">
    <path
      d="M7 20a4.5 4.5 0 1 1 7-5.4c1-1.6.4-4-1.6-4.4-1.7-.4-2.9.7-2.7 2.1M13.6 12a5 5 0 0 1 8.9 3.1c0 2.6-2 4.3-4.3 4.3-1.9 0-3.2-1-3.7-2.3M18 9c1-1.4 3.4-1.7 4.4.1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="19.5" cy="6.2" r="1.1" fill="currentColor" />
    <path d="M19.9 8c.6.5 1 1.1 1 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Svg>
);

/**
 * A small Om-inspired divider glyph used between sections of devotional
 * text — a quiet visual pause rather than a plain <hr>.
 */
export const OmDivider = ({ size = 22, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      margin: "4px 0",
      ...style,
    }}
  >
    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(242,193,78,0.35))" }} />
    <Svg size={size} viewBox="0 0 32 32" style={{ color: "#f2c14e", opacity: 0.85 }}>
      <path
        d="M7 20a4.5 4.5 0 1 1 7-5.4c1-1.6.4-4-1.6-4.4-1.7-.4-2.9.7-2.7 2.1M13.6 12a5 5 0 0 1 8.9 3.1c0 2.6-2 4.3-4.3 4.3-1.9 0-3.2-1-3.7-2.3M18 9c1-1.4 3.4-1.7 4.4.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="6.2" r="0.9" fill="currentColor" />
      <path d="M19.9 8c.6.5 1 1.1 1 2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
    <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(242,193,78,0.35), transparent)" }} />
  </div>
);
