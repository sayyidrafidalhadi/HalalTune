import { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, Image, X, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services';

interface FileUploadProps {
  accept: string;
  label: string;
  type: 'audio' | 'image';
  value: string;
  onChange: (url: string) => void;
}

export function FileUpload({ accept, label, type, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [localUrl, setLocalUrl] = useState(value);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalUrl(value);
  }, [value]);

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = type === 'audio'
        ? await uploadService.uploadAudio(file)
        : await uploadService.uploadImage(file, type === 'image' ? 'covers' : '');
      setLocalUrl(url);
      onChange(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  const displayUrl = localUrl || value;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-secondary">{label}</label>

      {displayUrl ? (
        <div className="relative flex items-center gap-3 p-3 rounded-xl bg-surface border border-emerald/30">
          {type === 'audio' ? (
            <FileAudio size={20} className="text-emerald shrink-0" />
          ) : (
            <img src={displayUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">
              {type === 'audio' ? 'Audio file uploaded' : 'Cover image uploaded'}
            </p>
            <p className="text-xs text-text-muted truncate">{displayUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => { setLocalUrl(''); onChange(''); }}
            className="p-1 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : uploading ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
          <Loader2 size={20} className="text-emerald animate-spin shrink-0" />
          <span className="text-sm text-text-secondary">Uploading...</span>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
              dragOver
                ? 'border-emerald bg-emerald/5'
                : 'border-border hover:border-emerald/30 hover:bg-surface-hover'
            )}
          >
            {type === 'audio'
              ? <FileAudio size={24} className="text-text-secondary" />
              : <Image size={24} className="text-text-secondary" />
            }
            <p className="text-sm text-text-secondary">
              {type === 'audio' ? 'Drop audio file here' : 'Drop image here'}
            </p>
            <p className="text-xs text-text-muted">or click to browse</p>
          </div>
          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
