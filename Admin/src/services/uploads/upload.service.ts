const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const uploadService = {
  async uploadFile(file: File, resourceType: 'image' | 'video'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    const res = await fetch(endpoint, { method: 'POST', body: formData });

    if (!res.ok) {
      const text = await res.text();
      let msg = `Upload failed (${res.status})`;
      try {
        const data = JSON.parse(text);
        msg = data?.error?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();
    return data.secure_url || data.url;
  },

  async uploadAudio(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const url = await this.uploadFile(file, 'video');
    onProgress?.(100);
    return url;
  },

  async uploadImage(file: File, _folder: string, onProgress?: (progress: number) => void): Promise<string> {
    const url = await this.uploadFile(file, 'image');
    onProgress?.(100);
    return url;
  },

  async deleteFile(_bucket: string, _path: string) {
    console.warn('Cloudinary file deletion is not supported from the client');
  },

  validateAudioFile(file: File): string | null {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/flac'];
    const maxSize = 50 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid audio format. Supported: MP3, WAV, OGG, AAC, FLAC';
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 50MB';
    }
    return null;
  },

  validateImageFile(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const maxSize = 10 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid image format. Supported: JPEG, PNG, WebP, AVIF';
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 10MB';
    }
    return null;
  },
};
