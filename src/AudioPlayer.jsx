import React, { useState } from "react";

export default function AudioPlayer({ audioUrl, autoPlay = false, muted = false }) {
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
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) return 'youtube';
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    if (url.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) return 'audio';
    return 'unknown';
  };

  const getYoutubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;

    const urlString = url.trim();
    const patterns = [
      /(?:youtube(?:-nocookie)?\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/i,
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/i,
      /(?:youtube(?:-nocookie)?\.com\/embed\/)([A-Za-z0-9_-]{11})/i,
      /(?:youtube(?:-nocookie)?\.com\/v\/)([A-Za-z0-9_-]{11})/i,
      /(?:youtube(?:-nocookie)?\.com\/shorts\/)([A-Za-z0-9_-]{11})/i,
    ];

    for (const pattern of patterns) {
      const match = urlString.match(pattern);
      if (match && match[1]) return match[1];
    }

    try {
      const parsed = new URL(urlString);
      const vParam = parsed.searchParams.get('v');
      if (vParam) return vParam;
    } catch (error) {
      // ignore invalid URL parse failures
    }

    return null;
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
      <div style={{ width: "100%", maxWidth: "100%", margin: "0", padding: "0", aspectRatio: "16/9", display: "flex", justifyContent: "center" }}>
        <iframe
          loading="lazy"
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&playsinline=1`}
          style={{ width: "100%", height: "100%", border: "none", borderRadius: "0", boxSizing: "border-box", margin: "0", padding: "0" }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  if (platform === 'youtube') {
    const youtubeId = getYoutubeVideoId(audioUrl);
    if (!youtubeId) return <p style={{ color: '#ff6b6b' }}>Invalid YouTube link</p>;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return (
      <div style={{ width: "100%", maxWidth: "100%", margin: "0", padding: "0", aspectRatio: "16/9", display: "flex", justifyContent: "center" }}>
        <iframe
          loading="lazy"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&iv_load_policy=3&controls=1&playsinline=1&showinfo=0&disablekb=1&origin=${encodeURIComponent(origin)}`}
          style={{ width: "100%", height: "100%", borderRadius: "0", border: "none", boxSizing: "border-box", margin: "0", padding: "0" }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  if (platform === 'spotify') {
    return (
      <div style={{ width: "100%", maxWidth: "100%", margin: "0", padding: "0", display: "flex", justifyContent: "center" }}>
        <iframe
          loading="lazy"
          title="Spotify"
          src={audioUrl.replace('open.spotify.com', 'open.spotify.com/embed')}
          width="100%"
          height="280"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen"
          style={{ borderRadius: "0", boxSizing: "border-box", margin: "0", padding: "0" }}
        ></iframe>
      </div>
    );
  }

  if (platform === 'soundcloud') {
    return (
      <div style={{ width: "100%", maxWidth: "100%", margin: "0", padding: "0", display: "flex", justifyContent: "center" }}>
        <iframe
          loading="lazy"
          title="SoundCloud"
          width="100%"
          height="300"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(audioUrl)}&color=%23ffd700&auto_play=${autoPlay ? 'true' : 'false'}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`}
          style={{ borderRadius: "0", boxSizing: "border-box", margin: "0", padding: "0" }}
        ></iframe>
      </div>
    );
  }

  return <p style={{ color: '#ff6b6b' }}>Unsupported media format</p>;
}
