import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'skip_download': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Search YouTube and extract flat info for up to 15 results
            res = ydl.extract_info(f"ytsearch15:{query}", download=False)
            entries = res.get('entries', [])
            results = []
            
            for entry in entries:
                if not entry:
                    continue
                video_id = entry.get('id')
                if not video_id:
                    continue
                    
                title = entry.get('title') or "Unknown Title"
                uploader = entry.get('uploader') or entry.get('channel') or "YouTube Artist"
                
                # Normalize duration
                duration = entry.get('duration')
                try:
                    duration = int(duration) if duration is not None else 0
                except (ValueError, TypeError):
                    duration = 0
                
                # Resolve cover art thumbnail
                cover_art = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
                thumbnails = entry.get('thumbnails', [])
                if thumbnails:
                    # Select last thumbnail (often higher resolution)
                    cover_art = thumbnails[-1].get('url', cover_art)
                
                results.append({
                    "id": f"yt_{video_id}",
                    "youtubeId": video_id,
                    "title": title,
                    "artist": uploader,
                    "coverArt": cover_art,
                    "url": "", # Resolved dynamically on playback
                    "duration": duration,
                    "isYoutube": True,
                    "language": "YouTube"
                })
            
            return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stream', methods=['GET'])
def stream():
    video_id = request.args.get('id', '')
    if not video_id:
        return jsonify({"error": "id parameter required"}), 400
        
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio/best',
        'skip_download': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            # Retrieve stream URL from top-level or format entries
            url = info.get('url')
            if not url and 'formats' in info:
                # Filter specifically for audio-only streams
                audio_formats = [f for f in info['formats'] if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                if not audio_formats:
                    audio_formats = [f for f in info['formats'] if f.get('acodec') != 'none']
                if audio_formats:
                    # Find highest quality audio stream URL
                    # Sort formats by audio bitrate (abr) if available
                    audio_formats.sort(key=lambda x: x.get('abr') or 0, reverse=True)
                    url = audio_formats[0].get('url')
            
            # Absolute fallback
            if not url and 'formats' in info and info['formats']:
                url = info['formats'][0].get('url')
                
            if not url:
                return jsonify({"error": "No streaming URL could be resolved"}), 404
                
            return jsonify({"url": url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Run flask server locally
    app.run(host='127.0.0.1', port=port, debug=True)
