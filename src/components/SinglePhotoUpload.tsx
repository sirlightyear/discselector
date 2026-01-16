import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SinglePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpload: (url: string) => void;
  onPhotoRemove: () => void;
}

export function SinglePhotoUpload({ currentPhotoUrl, onPhotoUpload, onPhotoRemove }: SinglePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('disc-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('disc-photos')
        .getPublicUrl(filePath);

      onPhotoUpload(data.publicUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadError('Kunne ikke uploade foto. Prøv igen.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        {currentPhotoUrl ? (
          <>
            <button
              onClick={onPhotoRemove}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Fjern
            </button>
            <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Upload className="w-4 h-4" />
              Skift billede
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </>
        ) : (
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <Upload className="w-4 h-4" />
            Upload billede
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mt-2">
          {uploadError}
        </div>
      )}

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm mt-2">
          Uploader foto...
        </div>
      )}
    </div>
  );
}
