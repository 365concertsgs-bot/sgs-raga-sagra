/**
 * MEDIA LINK HANDLER - Standalone JavaScript Module
 * 
 * This file demonstrates how to handle media links (audio/video) from a database.
 * Can be used in vanilla JavaScript or adapted for any framework.
 * 
 * Usage:
 * 1. Add data-media-link attribute to any anchor tags
 * 2. Initialize MediaLinkHandler
 * 3. Media will auto-detect and play in appropriate player
 */

class MediaLinkHandler {
  constructor(options = {}) {
    this.videoPlayer = options.videoPlayer || document.createElement('video');
    this.audioPlayer = options.audioPlayer || document.createElement('audio');
    this.currentMediaType = null;
    this.currentMediaUrl = null;
    
    this.init();
  }

  /**
   * Initialize the media link handler
   */
  init() {
    this.attachEventListeners();
    this.setupPlayers();
  }

  /**
   * Setup video and audio player properties
   */
  setupPlayers() {
    // Configure video player
    this.videoPlayer.controls = true;
    this.videoPlayer.crossOrigin = 'anonymous';
    this.videoPlayer.style.cssText = `
      width: 100%;
      height: auto;
      max-width: 600px;
      border-radius: 8px;
    `;

    // Configure audio player
    this.audioPlayer.controls = true;
    this.audioPlayer.crossOrigin = 'anonymous';
    this.audioPlayer.style.cssText = `
      width: 100%;
      max-width: 400px;
      margin: 10px 0;
    `;

    // Add event listeners
    this.videoPlayer.addEventListener('loadstart', () => this.onMediaLoadStart());
    this.videoPlayer.addEventListener('loadeddata', () => this.onMediaLoaded());
    this.videoPlayer.addEventListener('error', (e) => this.onMediaError(e));

    this.audioPlayer.addEventListener('loadstart', () => this.onMediaLoadStart());
    this.audioPlayer.addEventListener('loadeddata', () => this.onMediaLoaded());
    this.audioPlayer.addEventListener('error', (e) => this.onMediaError(e));
  }

  /**
   * Detect media file type from URL
   * @param {string} url - Media URL
   * @returns {string} - 'video', 'audio', or 'unknown'
   */
  getMediaFileType(url) {
    const videoFormats = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i;
    const audioFormats = /\.(mp3|wav|aac|ogg|m4a|flac)(\?|$)/i;

    if (videoFormats.test(url)) return 'video';
    if (audioFormats.test(url)) return 'audio';
    return 'unknown';
  }

  /**
   * Attach event listeners to all media links
   */
  attachEventListeners() {
    const mediaLinks = document.querySelectorAll('[data-media-link]');
    
    mediaLinks.forEach((link) => {
      link.addEventListener('click', (event) => this.handleMediaLinkClick(event));
    });

    console.log(`Attached listeners to ${mediaLinks.length} media link(s)`);
  }

  /**
   * Handle media link click event
   * @param {Event} event - Click event
   */
  handleMediaLinkClick(event) {
    event.preventDefault(); // Prevent download/navigation

    const mediaUrl = event.currentTarget.href || event.currentTarget.dataset.mediaUrl;
    
    if (!mediaUrl) {
      console.warn('No media URL found');
      return;
    }

    this.loadMedia(mediaUrl);
  }

  /**
   * Load and play media based on URL
   * @param {string} url - Media URL to load
   */
  loadMedia(url) {
    const mediaType = this.getMediaFileType(url);
    this.currentMediaType = mediaType;
    this.currentMediaUrl = url;

    console.log(`Loading ${mediaType}:`, url);

    if (mediaType === 'video') {
      this.showVideo(url);
    } else if (mediaType === 'audio') {
      this.showAudio(url);
    } else {
      console.error('Unsupported media format:', url);
      this.onMediaError(new Error('Unsupported media format'));
    }
  }

  /**
   * Display and play video
   * @param {string} url - Video URL
   */
  showVideo(url) {
    this.videoPlayer.src = url;
    this.audioPlayer.style.display = 'none';
    this.videoPlayer.style.display = 'block';
    
    // Auto-play
    this.videoPlayer.play().catch((error) => {
      console.warn('Autoplay blocked:', error);
    });
  }

  /**
   * Display and play audio
   * @param {string} url - Audio URL
   */
  showAudio(url) {
    this.audioPlayer.src = url;
    this.videoPlayer.style.display = 'none';
    this.audioPlayer.style.display = 'block';
    
    // Auto-play
    this.audioPlayer.play().catch((error) => {
      console.warn('Autoplay blocked:', error);
    });
  }

  /**
   * Handle media load start
   */
  onMediaLoadStart() {
    console.log('Media loading started...');
  }

  /**
   * Handle media successfully loaded
   */
  onMediaLoaded() {
    console.log('Media loaded successfully!');
  }

  /**
   * Handle media error
   * @param {Error} error - Error object
   */
  onMediaError(error) {
    const errorMsg = error?.target?.error?.message || 'Failed to load media';
    console.error('Media playback error:', errorMsg);
    alert(`Error loading media: ${errorMsg}`);
  }

  /**
   * Stop all playback
   */
  stop() {
    this.videoPlayer.pause();
    this.audioPlayer.pause();
  }

  /**
   * Pause current playback
   */
  pause() {
    if (this.currentMediaType === 'video') {
      this.videoPlayer.pause();
    } else if (this.currentMediaType === 'audio') {
      this.audioPlayer.pause();
    }
  }

  /**
   * Resume playback
   */
  play() {
    if (this.currentMediaType === 'video') {
      this.videoPlayer.play();
    } else if (this.currentMediaType === 'audio') {
      this.audioPlayer.play();
    }
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Basic HTML Setup
 * 
 * <div id="media-container">
 *   <video id="video-player"></video>
 *   <audio id="audio-player"></audio>
 * </div>
 * 
 * <div id="media-links">
 *   <a href="https://example.com/video.mp4" data-media-link>Play Video</a>
 *   <a href="https://example.com/audio.mp3" data-media-link>Play Audio</a>
 * </div>
 */

/**
 * EXAMPLE 2: Initialize in Vanilla JavaScript
 * 
 * const handler = new MediaLinkHandler({
 *   videoPlayer: document.getElementById('video-player'),
 *   audioPlayer: document.getElementById('audio-player')
 * });
 */

/**
 * EXAMPLE 3: Using with Database Results
 * 
 * async function loadMediaFromDatabase() {
 *   const response = await fetch('/api/media');
 *   const mediaItems = await response.json();
 *   
 *   const container = document.getElementById('media-links');
 *   mediaItems.forEach(item => {
 *     const link = document.createElement('a');
 *     link.href = item.url;
 *     link.textContent = item.title;
 *     link.setAttribute('data-media-link', '');
 *     container.appendChild(link);
 *   });
 *   
 *   // Re-attach listeners to new links
 *   handler.attachEventListeners();
 * }
 */

// ============================================================================
// EXPORT FOR MODULE SYSTEMS
// ============================================================================

// For CommonJS
// module.exports = MediaLinkHandler;

// For ES6 modules
// export default MediaLinkHandler;

// For vanilla JS - just include the script tag and use window.MediaLinkHandler
