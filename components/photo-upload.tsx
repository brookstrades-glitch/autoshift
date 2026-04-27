'use client';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';

interface Props {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  max?: number;
}

export default function PhotoUpload({ photos, onPhotosChange, max = 8 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next = [...photos, ...Array.from(files)].slice(0, max);
    onPhotosChange(next);
  }

  function remove(idx: number) {
    onPhotosChange(photos.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
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
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={i} className="relative aspect-square">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-md"
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 shadow"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}