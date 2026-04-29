'use client';
import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type PhotoStatus = 'compressing' | 'uploading' | 'done' | 'error';
export type UploadStatus = 'idle' | 'in_progress' | 'done' | 'partial_error';

interface PhotoEntry {
  id: string;
  file: File;
  status: PhotoStatus;
  url?: string;
  path?: string;
  previewUrl: string;
}

interface Props {
  max?: number;
  onStatusChange?: (status: UploadStatus, urls: string[]) => void;
  disableCleanup?: boolean;
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export default function PhotoUpload({ max = 8, onStatusChange, disableCleanup = false }: Props) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadedPathsRef = useRef<string[]>([]);
  const abortedIdsRef = useRef<Set<string>>(new Set());
  const disableCleanupRef = useRef(disableCleanup);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => { disableCleanupRef.current = disableCleanup; }, [disableCleanup]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);

  // Notify parent whenever photo statuses change
  useEffect(() => {
    if (photos.length === 0) {
      onStatusChangeRef.current?.('idle', []);
      return;
    }
    const active = photos.some(p => p.status === 'compressing' || p.status === 'uploading');
    const doneUrls = photos.filter(p => p.status === 'done').map(p => p.url!);
    if (active) {
      onStatusChangeRef.current?.('in_progress', doneUrls);
      return;
    }
    const hasError = photos.some(p => p.status === 'error');
    onStatusChangeRef.current?.(hasError ? 'partial_error' : 'done', doneUrls);
  }, [photos]);

  // Delete any un-submitted uploads on unmount
  useEffect(() => {
    return () => {
      if (!disableCleanupRef.current && uploadedPathsRef.current.length > 0) {
        supabase.storage
          .from('vehicle-photos')
          .remove([...uploadedPathsRef.current])
          .catch(err => console.error('[PhotoUpload] unmount cleanup failed:', err));
      }
    };
  }, []);

  // Best-effort cleanup on tab close
  useEffect(() => {
    function handleBeforeUnload() {
      if (!disableCleanupRef.current && uploadedPathsRef.current.length > 0) {
        supabase.storage
          .from('vehicle-photos')
          .remove([...uploadedPathsRef.current])
          .catch(() => {});
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  async function processFile(id: string, file: File) {
    try {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'compressing' } : p));
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

      // Check if removed during compression
      if (abortedIdsRef.current.has(id)) {
        abortedIdsRef.current.delete(id);
        return;
      }

      setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'uploading' } : p));
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('vehicle-photos')
        .upload(path, compressed, { contentType: compressed.type || 'image/jpeg' });

      if (error) throw error;

      // Check if removed during upload — delete the just-stored file
      if (abortedIdsRef.current.has(id)) {
        abortedIdsRef.current.delete(id);
        supabase.storage.from('vehicle-photos').remove([path])
          .catch(err => console.error('[PhotoUpload] abort cleanup failed:', err));
        return;
      }

      const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(path);
      uploadedPathsRef.current = [...uploadedPathsRef.current, path];

      setPhotos(prev => prev.map(p =>
        p.id === id ? { ...p, status: 'done', url: urlData.publicUrl, path } : p
      ));
    } catch (err) {
      if (abortedIdsRef.current.has(id)) {
        abortedIdsRef.current.delete(id);
        return;
      }
      console.error('[PhotoUpload] upload error:', err);
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'error' } : p));
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const MAX_MB = 20;
    const remaining = max - photos.length;
    if (remaining <= 0) return;

    const valid = Array.from(files)
      .filter(f => {
        if (f.size > MAX_MB * 1024 * 1024) {
          alert(`"${f.name}" is over ${MAX_MB} MB and can't be uploaded.`);
          return false;
        }
        return true;
      })
      .slice(0, remaining);

    if (valid.length === 0) return;

    const newEntries: PhotoEntry[] = valid.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: 'compressing' as PhotoStatus,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos(prev => [...prev, ...newEntries]);
    newEntries.forEach(e => processFile(e.id, e.file));
  }

  function retryPhoto(id: string) {
    const entry = photos.find(p => p.id === id);
    if (entry) processFile(id, entry.file);
  }

  function removePhoto(id: string) {
    const entry = photos.find(p => p.id === id);
    if (!entry) return;

    URL.revokeObjectURL(entry.previewUrl);

    if (entry.status === 'done' && entry.path) {
      uploadedPathsRef.current = uploadedPathsRef.current.filter(p => p !== entry.path);
      supabase.storage.from('vehicle-photos').remove([entry.path])
        .catch(err => console.error('[PhotoUpload] delete failed:', err));
    } else if (entry.status === 'compressing' || entry.status === 'uploading') {
      abortedIdsRef.current.add(id);
    }

    setPhotos(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className="space-y-4">
      {photos.length < max && (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click or drag photos here</p>
          <p className="text-xs text-muted-foreground mt-1">Minimum 1, maximum {max} photos</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative aspect-square">
              <img
                src={photo.previewUrl}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
              {(photo.status === 'compressing' || photo.status === 'uploading') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-md gap-1">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                  <span className="text-white text-xs">
                    {photo.status === 'compressing' ? 'Compressing…' : 'Uploading…'}
                  </span>
                </div>
              )}
              {photo.status === 'done' && (
                <div className="absolute top-1 left-1">
                  <CheckCircle2 className="h-5 w-5 text-green-400 drop-shadow" />
                </div>
              )}
              {photo.status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-md gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <button
                    type="button"
                    onClick={() => retryPhoto(photo.id)}
                    className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                  >
                    Retry
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                aria-label="Remove photo"
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
