import { useState, useCallback } from 'react';
import { uploadService } from '@/services';
import toast from 'react-hot-toast';

interface UseMediaUploadOptions {
  folder: string;
  onSuccess?: (url: string) => void;
}

export function useMediaUpload({ folder, onSuccess }: UseMediaUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const error = folder === 'audio'
        ? uploadService.validateAudioFile(file)
        : uploadService.validateImageFile(file);

      if (error) {
        toast.error(error);
        return null;
      }

      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const url = folder === 'audio'
        ? await uploadService.uploadAudio(file, setProgress)
        : await uploadService.uploadImage(file, folder, setProgress);

      clearInterval(interval);
      setProgress(100);
      onSuccess?.(url);
      return url;
    } catch (err) {
      toast.error('Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }, [folder, onSuccess]);

  return { upload, uploading, progress };
}
