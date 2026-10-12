import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCaptured: (dataUrl: string) => void;
  label?: string;
  initialPhotoUrl?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoCaptured,
  label = 'Evidencia fotográfica (Cámara / Galería)',
  initialPhotoUrl,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress or read file
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
      onPhotoCaptured(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    onPhotoCaptured('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <Camera className="w-3.5 h-3.5 text-blue-600" />
        <span>{label}</span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {photoPreview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs group max-w-sm">
          <img
            src={photoPreview}
            alt="Evidencia fotográfica capturada"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3">
            <span className="text-white text-[11px] font-bold flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Foto adjunta
            </span>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer transition-colors"
              title="Eliminar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3.5 px-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50/70 hover:bg-blue-50/40 text-slate-600 hover:text-blue-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer text-xs font-bold"
        >
          <Camera className="w-4 h-4 text-blue-600" />
          <span>Tomar Foto con Celular o Subir Imagen</span>
        </button>
      )}
    </div>
  );
};
