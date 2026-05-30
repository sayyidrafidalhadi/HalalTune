const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const uploadService = {
  async uploadFile(file: File, resourceType: 'image' | 'video', onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    if (resourceType === 'video') {
      formData.append('resource_type', 'video');
    }

    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType === 'video' ? 'video' : 'image'}/upload`;

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url || data.url);
          } catch {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.open('POST', url);
      xhr.send(formData);
    });
  },

  async uploadAudio(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'video', onProgress);
  },

  async uploadImage(file: File, _folder: string, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'image', onProgress);
  },

  async deleteFile(_bucket: string, _path: string) {
    // Cloudinary deletion requires the private API key on the server side
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
