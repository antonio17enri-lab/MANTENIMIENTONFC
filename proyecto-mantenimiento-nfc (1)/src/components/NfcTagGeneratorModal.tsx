import React, { useState } from 'react';
import { X, Printer, Radio, QrCode, Download, Check } from 'lucide-react';
import { Machine } from '../types';

interface NfcTagGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  activeMachine: Machine;
  onSelectMachine: (machineId: string) => void;
}

export const NfcTagGeneratorModal: React.FC<NfcTagGeneratorModalProps> = ({
  isOpen,
  onClose,
  machines,
  activeMachine,
  onSelectMachine,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'metal' | 'sticker' | 'badge'>('metal');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm">Generador de Etiquetas Físicas NFC / QR</h3>
              <p className="text-[11px] text-slate-400">
                Diseño idéntico a las placas industriales montadas en maquinaria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
          
          {/* Machine & Style Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Máquina seleccionada:</label>
              <select
                value={activeMachine.id}
                onChange={(e) => onSelectMachine(e.target.value)}
                className="bg-white font-bold text-slate-800 p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estilo de placa:</label>
              <div className="flex items-center gap-1.5">
                {(['metal', 'sticker', 'badge'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs capitalize cursor-pointer transition-colors ${
                      selectedFormat === fmt
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {fmt === 'metal' ? 'Placa Metálica' : fmt === 'sticker' ? 'Adhesivo Vinilo' : 'Tarjeta Operario'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PRINTABLE PHYSICAL TAG (Exact replica of the tag in the photo) */}
          <div className="flex justify-center p-4 bg-slate-100/70 rounded-2xl border border-slate-200/80">
            <div
              id="printable-nfc-tag"
              className={`w-72 sm:w-80 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative shadow-xl transition-all ${
                selectedFormat === 'metal'
                  ? 'bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 text-slate-900 border-4 border-slate-400 ring-2 ring-slate-500/30'
                  : selectedFormat === 'sticker'
                  ? 'bg-white text-slate-900 border-4 border-blue-600 ring-4 ring-blue-100'
                  : 'bg-slate-900 text-white border-2 border-slate-700'
              }`}
            >
              {/* Corner industrial rivets if metal */}
              {selectedFormat === 'metal' && (
                <>
                  <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-slate-400 border border-slate-500 shadow-inner flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-slate-600 transform rotate-45"></div>
                  </div>
                  <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-slate-400 border border-slate-500 shadow-inner flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-slate-600 transform -rotate-45"></div>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-slate-400 border border-slate-500 shadow-inner flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-slate-600 transform -rotate-45"></div>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-slate-400 border border-slate-500 shadow-inner flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-slate-600 transform rotate-45"></div>
                  </div>
                </>
              )}

              {/* NFC Iconic Wave */}
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter">N</span>
                <span className="text-3xl sm:text-4xl font-bold tracking-tight opacity-80">))</span>
              </div>

              {/* NFC text */}
              <div className="text-sm font-black tracking-widest uppercase mb-1">
                NFC TAG
              </div>

              {/* Machine Code Highlighted */}
              <div className="my-2 px-6 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-2xl sm:text-3xl font-black tracking-wider shadow-inner">
                {activeMachine.code}
              </div>

              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {activeMachine.category} • {activeMachine.name}
              </div>

              <div className="text-[10px] text-slate-500 mt-1 mb-3">
                {activeMachine.location} • {activeMachine.brand} {activeMachine.model}
              </div>

              {/* Instruction banner matching bottom caption of photo */}
              <div className="w-full bg-blue-600 text-white p-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
                <span>Acerca tu celular al tag NFC para acceder</span>
              </div>

              {/* QR Code backup for non-NFC devices */}
              <div className="mt-3 flex items-center justify-between w-full pt-2 border-t border-slate-300 text-[10px] text-slate-500">
                <div className="text-left">
                  <span className="font-bold block text-slate-800">Acceso Alternativo QR</span>
                  <span>Escaneo por cámara</span>
                </div>
                <div className="w-10 h-10 bg-white p-1 rounded-md border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2">
            <Radio className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block">Compatibilidad Universal:</span>
              <span>
                Cualquier etiqueta pasiva NTAG213 / NTAG215 / NTAG216 programada con la URL de la máquina abrirá directamente su ficha técnica y checklist sin login requerido.
              </span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Etiqueta</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
