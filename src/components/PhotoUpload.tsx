import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 10 }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      setUploadError(`Du kan maksimalt uploade ${maxPhotos} fotos`);
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      onPhotosChange([...photos, ...urls]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      setUploadError('Kunne ikke uploade fotos. Prøv igen.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-700">
          Fotos ({photos.length}/{maxPhotos})
        </label>
        {photos.length < maxPhotos && (
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <Upload className="w-4 h-4" />
            Upload
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
          {uploadError}
        </div>
      )}

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm mb-3">
          Uploader fotos...
        </div>
      )}

      {photos.length === 0 ? (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Ingen fotos uploadet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Fjern foto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
