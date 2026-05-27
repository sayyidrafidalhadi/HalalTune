import { supabase } from '../supabase';

interface UploadOptions {
  file: File;
  bucket: string;
  path: string;
  onProgress?: (progress: number) => void;
}

export const uploadService = {
  async uploadFile({ file, bucket, path, onProgress }: UploadOptions): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${path}/${crypto.randomUUID()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    onProgress?.(100);
    return publicUrl;
  },

  async uploadAudio(file: File, onProgress?: (progress: number) => void) {
    return this.uploadFile({
      file,
      bucket: 'audio',
      path: `tracks/${crypto.randomUUID()}`,
      onProgress,
    });
  },

  async uploadImage(file: File, folder: string, onProgress?: (progress: number) => void) {
    return this.uploadFile({
      file,
      bucket: 'images',
      path: folder,
      onProgress,
    });
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
  },

  validateAudioFile(file: File): string | null {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid audio format. Supported: MP3, WAV, OGG, AAC';
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 50MB';
    }
    return null;
  },

  validateImageFile(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid image format. Supported: JPEG, PNG, WebP, AVIF';
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 10MB';
    }
    return null;
  },
};
