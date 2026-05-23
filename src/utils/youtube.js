const LOCAL_API = 'http://127.0.0.1:5000';

const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://pipedapi.lunar.icu',
  'https://pipedapi.colt.top'
];

let isLocalAvailable = null; // null = unknown, true = active, false = offline

async function checkLocalHealth() {
  try {
    const response = await fetch(`${LOCAL_API}/health`, { signal: AbortSignal.timeout(1200) });
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok') {
        isLocalAvailable = true;
        return true;
      }
    }
  } catch (err) {}
  isLocalAvailable = false;
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
  
  // Dynamically check if the local python server is running on first request
  if (isLocalAvailable === null) {
    await checkLocalHealth();
  }
  
  if (isLocalAvailable) {
    try {
      const response = await fetch(`${LOCAL_API}/search?q=${encodeURIComponent(purified)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Local search failed, trying public Piped fallback...', err);
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
  // Check health status of local server
  if (isLocalAvailable === null) {
    await checkLocalHealth();
  }
  
  if (isLocalAvailable) {
    try {
      const response = await fetch(`${LOCAL_API}/stream?id=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          return data.url;
        }
      }
    } catch (err) {
      console.warn('Local stream resolution failed, trying public Piped fallback...', err);
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
  return isLocalAvailable;
}

