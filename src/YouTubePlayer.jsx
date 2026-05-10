import React from "react";

const YOUTUBE_URL_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})(?:[&?].*)?$/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/,
];

function extractYouTubeId(videoUrl) {
  if (!videoUrl || typeof videoUrl !== "string") return null;

  const trimmedUrl = videoUrl.trim();

  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) return match[1];
  }

  try {
    const url = new URL(trimmedUrl);
    if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
      return url.searchParams.get("v") || null;
    }
  } catch (error) {
    return null;
  }

  return null;
}

export default function YouTubePlayer({ videoUrl, title = "YouTube video player" }) {
  const videoId = extractYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div style={{ color: "#ff6b6b", fontSize: "0.95rem", lineHeight: 1.4 }}>
        Invalid YouTube link.
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&showinfo=0`;

  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", overflow: "hidden", backgroundColor: "#000" }}>
      <iframe
        title={title}
        src={embedUrl}
        loading="lazy"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
