const LOCAL_API = 'http://127.0.0.1:5000';

const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://pipedapi.lunar.icu',
  'https://pipedapi.colt.top'
];

let isBackendAvailable = null; // null = unknown, true = active, false = offline
let activeApiUrl = ''; // Base URL for the active API

async function checkBackendHealth() {
  // 1. Try checking the current host origin first (e.g. on Vercel deployment)
  try {
    const response = await fetch('/health', { signal: AbortSignal.timeout(1500) });
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok') {
        isBackendAvailable = true;
        activeApiUrl = window.location.origin;
        return true;
      }
    }
  } catch (err) {}

  // 2. Fallback: try checking the local dev server
  try {
    const response = await fetch(`${LOCAL_API}/health`, { signal: AbortSignal.timeout(1200) });
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok') {
        isBackendAvailable = true;
        activeApiUrl = LOCAL_API;
        return true;
      }
    }
  } catch (err) {}

  isBackendAvailable = false;
  activeApiUrl = '';
  return false;
}

async function fetchFromPiped(path) {
  let lastError = null;
  for (const instance of PIPED_INSTANCES) {
    try {
      const response = await fetch(`${instance}${path}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All Piped instances failed');
}

/**
 * Purifies query to align with HalalTune vocal-only theme
 */
function purifyQuery(query) {
  const lowercase = query.toLowerCase();
  let purified = query;
  if (
    !lowercase.includes('vocal') &&
    !lowercase.includes('nasheed') &&
    !lowercase.includes('acapella') &&
    !lowercase.includes('instrument-free')
  ) {
    purified += ' vocal only';
  }
  return purified;
}

export async function searchYoutube(query) {
  const purified = purifyQuery(query);
  
  // Dynamically check if the backend is running
  if (isBackendAvailable === null) {
    await checkBackendHealth();
  }
  
  if (isBackendAvailable) {
    try {
      const response = await fetch(`${activeApiUrl}/search?q=${encodeURIComponent(purified)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend search failed, trying public Piped fallback...', err);
    }
  }
  
  // Public Piped Fallback
  const data = await fetchFromPiped(`/search?q=${encodeURIComponent(purified)}&filter=videos`);
  return (data.items || [])
    .filter((item) => item.type === 'stream' || item.type === 'video')
    .map((item) => {
      const videoId = item.url.split('v=')[1] || item.url.split('/').pop();
      return {
        id: `yt_${videoId}`,
        youtubeId: videoId,
        title: item.title,
        artist: item.uploaderName || 'YouTube Artist',
        coverArt: item.thumbnail || 'icon.png',
        url: '', // Resolved on playback
        duration: item.duration || 0,
        isYoutube: true,
        language: 'YouTube',
      };
    });
}

export async function fetchYoutubeStreamUrl(videoId) {
  // Check health status of backend
  if (isBackendAvailable === null) {
    await checkBackendHealth();
  }
  
  if (isBackendAvailable) {
    try {
      const response = await fetch(`${activeApiUrl}/stream?id=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          return data.url;
        }
      }
    } catch (err) {
      console.warn('Backend stream resolution failed, trying public Piped fallback...', err);
    }
  }
  
  // Public Piped Fallback
  const data = await fetchFromPiped(`/streams/${videoId}`);
  const audioStreams = data.audioStreams || [];
  if (audioStreams.length === 0) {
    throw new Error('No audio streams found');
  }
  // Find M4A format (highly compatible with HTML5 Audio on Safari/iOS & Chrome/Android)
  const m4aStream = audioStreams.find(
    (s) => s.format === 'M4A' || s.mimeType?.includes('audio/mp4')
  ) || audioStreams[0];
  return m4aStream.url;
}

export function isLocalBackendActive() {
  return isBackendAvailable;
}

