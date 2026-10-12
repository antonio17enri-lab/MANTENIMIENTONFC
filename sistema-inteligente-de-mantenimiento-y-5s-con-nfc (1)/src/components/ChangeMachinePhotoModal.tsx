import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Link,
  RefreshCw,
  Eye,
  Layers
} from 'lucide-react';
import { Machine } from '../types';

export interface PredefinedPhoto {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
}

export const DEFAULT_MACHINE_PHOTOS: PredefinedPhoto[] = [
  {
    id: 'torno-paralelo',
    name: 'Torno Paralelo Mecánico',
    category: 'TORNO',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Bancada templada, roscado cilíndrico y plato universal de 3 garras.',
  },
  {
    id: 'fresadora-universal',
    name: 'Fresadora Universal / Torreta',
    category: 'FRESADORA',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
    description: 'Cabezal bi-rotativo para mecanizado de ranuras, engranajes y caras planas.',
  },
  {
    id: 'prensa-hidraulica',
    name: 'Prensa Hidráulica de Estampado',
    category: 'PRENSA',
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    description: 'Capacidad de alto tonelaje para corte, doblado y embutición profunda de chapa.',
  },
  {
    id: 'centro-mecanizado-cnc',
    name: 'Centro de Mecanizado CNC Vertical',
    category: 'CNC',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    description: 'Control numérico computarizado con cambiador automático de 24 herramientas.',
  },
  {
    id: 'soldadura-industrial',
    name: 'Estación de Soldadura TIG / MIG',
    category: 'SOLDADURA',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    description: 'Equipo inverter para cordones de alta resistencia y acero inoxidable.',
  },
  {
    id: 'compresor-tornillo',
    name: 'Compresor de Tornillo Rotativo',
    category: 'COMPRESOR',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    description: 'Suministro continuo de aire comprimido seco a 8-10 bar para toda la nave.',
  },
  {
    id: 'cortadora-laser',
    name: 'Cortadora Láser de Fibra Óptica',
    category: 'CORTE',
    url: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80',
    description: 'Corte por resonador de fibra para chapas de acero, bronce y aluminio.',
  },
  {
    id: 'taladro-columna',
    name: 'Taladro de Columna / Radial',
    category: 'TALADRO',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
    description: 'Husillo cónico morse con avance micrométrico para brocas de gran diámetro.',
  },
  {
    id: 'rectificadora-plana',
    name: 'Rectificadora Plana Tangencial',
    category: 'RECTIFICADORA',
    url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
    description: 'Muela abrasiva y mesa electromagnética para tolerancias milimétricas.',
  },
  {
    id: 'celda-robotica',
    name: 'Celda Robótica y Automatización',
    category: 'ROBÓTICA',
    url: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    description: 'Manipulador antropomórfico para paletizado, carga de piezas y soldadura.',
  },
];

interface ChangeMachinePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
  onSavePhoto: (machineId: string, newImageUrl: string) => void;
}

export const ChangeMachinePhotoModal: React.FC<ChangeMachinePhotoModalProps> = ({
  isOpen,
  onClose,
  machine,
  onSavePhoto,
}) => {
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(
    machine.imageUrl || DEFAULT_MACHINE_PHOTOS[0].url
  );
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedPhotoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim().startsWith('http')) {
      setSelectedPhotoUrl(customUrlInput.trim());
    }
  };

  const handleSave = () => {
    onSavePhoto(machine.id, selectedPhotoUrl);
    onClose();
  };

  const filteredGallery = DEFAULT_MACHINE_PHOTOS.filter((p) => {
    if (selectedCategoryFilter === 'all') return true;
    return p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {machine.code}
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Cambiar Foto de la Máquina
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {machine.name} • {machine.category} ({machine.brand} {machine.model})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Banner */}
        <div className="px-5 pt-4 pb-2 bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-36 h-24 sm:w-44 sm:h-28 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md shrink-0 bg-slate-950">
            <img
              src={selectedPhotoUrl}
              alt="Vista previa de máquina"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default if URL breaks
                (e.target as HTMLImageElement).src = DEFAULT_MACHINE_PHOTOS[0].url;
              }}
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-cyan-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
              {machine.code}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
              <Eye className="w-3.5 h-3.5" /> Vista Previa Seleccionada
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              Esta imagen se mostrará en el Terminal Operario, Ficha Técnica y Dashboard
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Puedes elegir una foto industrial predeterminada o subir la foto real de la máquina desde tu teléfono o cámara.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 bg-white flex items-center gap-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'gallery'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fotos Predeterminadas ({DEFAULT_MACHINE_PHOTOS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>Subir / Tomar Foto Real</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'url'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Pegar URL Web</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: PREDETERMINED GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-600">
                  Selecciona una foto industrial de alta calidad:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
                  {['all', 'torno', 'fresadora', 'prensa', 'cnc', 'soldadura', 'compresor'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                        selectedCategoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of machine photos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredGallery.map((photo) => {
                  const isSelected = selectedPhotoUrl === photo.url;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhotoUrl(photo.url)}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 ${
                        isSelected
                          ? 'border-indigo-600 ring-4 ring-indigo-500/20 shadow-md'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="relative h-28 w-full overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                          {photo.category}
                        </div>
                      </div>
                      <div className="p-2 bg-white">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {photo.name}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {photo.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FROM DEVICE OR TAKE PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl text-center space-y-3 bg-slate-50/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Sube una foto o tómala directamente con la cámara
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Puedes tomarle una foto a la máquina real en tu taller o seleccionar una imagen desde la galería de tu celular o computadora.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo de Imagen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment');
                        fileInputRef.current.click();
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Abrir Cámara</span>
                  </button>
                </div>
              </div>

              {selectedPhotoUrl.startsWith('data:') && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>¡Foto personalizada cargada exitosamente lista para guardar!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoUrl(machine.imageUrl || DEFAULT_MACHINE_PHOTOS[0].url)}
                    className="text-slate-500 hover:text-rose-600 text-xs underline cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Enlace directo de la imagen (URL https://...):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/fotos/torno-m001.jpg"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                  >
                    Aplicar
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pega un enlace de Google Drive, Unsplash, Imgur o tu servidor corporativo.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            id="btn-confirm-save-photo"
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Foto para {machine.code}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
