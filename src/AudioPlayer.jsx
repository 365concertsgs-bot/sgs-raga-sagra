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
