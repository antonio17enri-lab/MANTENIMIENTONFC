import React, { useState, useEffect } from 'react';
import { X, Radio, Copy, Check, QrCode, Smartphone, Sparkles, ExternalLink, Share2, Layers } from 'lucide-react';
import { Machine } from '../types';

interface NfcConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  initialMachineCode?: string;
}

export const NfcConfigModal: React.FC<NfcConfigModalProps> = ({
  isOpen,
  onClose,
  machines,
  initialMachineCode,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(
    initialMachineCode || (machines[0]?.code ?? 'M-001')
  );
  const [copied, setCopied] = useState(false);
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<string | null>(null);

  // Sync selected machine when opening or changing initialMachineCode
  useEffect(() => {
    if (initialMachineCode) {
      setSelectedCode(initialMachineCode);
      setNfcStatus(null);
    }
  }, [initialMachineCode, isOpen]);

  if (!isOpen) return null;

  const currentMachine = machines.find((m) => m.code === selectedCode) || machines[0];
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tudominio.com';
  const tagUrl = currentMachine ? `${origin}/?maquina=${currentMachine.code}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(tagUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWriteNfc = async () => {
    if (!('NDEFReader' in window)) {
      setNfcStatus('⚠️ Tu navegador o dispositivo actual no soporta Web NFC directo. Te recomendamos usar la app gratuita "NFC Tools" (sigue las instrucciones abajo) o copiar el link.');
      return;
    }

    try {
      setNfcWriting(true);
      setNfcStatus(`Acerca tu etiqueta NFC física a la parte trasera del celular para grabar ${selectedCode}...`);
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: tagUrl }],
      });
      setNfcStatus(`✅ ¡Éxito! El Tag NFC quedó grabado para abrir ${currentMachine?.code} (${currentMachine?.name}).`);
    } catch (err: any) {
      console.error(err);
      setNfcStatus('❌ No se pudo escribir. Asegúrate de tener NFC activado en los ajustes de tu celular y vuelve a intentar.');
    } finally {
      setNfcWriting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-4 sm:my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Grabar Etiquetas NFC Físicas</h3>
              <p className="text-[11px] text-slate-400">Programa tus chips NFC para M-001 a M-006 o copia su link directo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          
          {/* Quick Machine Pills Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 block">Elige la máquina a grabar en tu NFC:</label>
              <span className="text-[10px] text-blue-600 font-bold">Total: {machines.length}</span>
            </div>

            {/* Quick Pills for M-001 to M-006 and beyond */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-100/80 rounded-2xl border border-slate-200">
              {machines.map((m) => {
                const isSelected = m.code === selectedCode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedCode(m.code);
                      setNfcStatus(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs scale-102 ring-2 ring-blue-300'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{m.code}</span>
                    {isSelected && <Check className="w-3 h-3 text-cyan-200" />}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Alternative */}
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                setNfcStatus(null);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.code}>
                  {m.code} - {m.name} ({m.location})
                </option>
              ))}
            </select>
          </div>

          {/* Machine preview badge */}
          {currentMachine && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="font-black text-blue-900 text-sm font-mono block">{currentMachine.code}</span>
                <p className="text-slate-700 font-bold text-xs truncate">{currentMachine.name}</p>
                <p className="text-slate-500 text-[10px] truncate">{currentMachine.location} • Resp: {currentMachine.responsible}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 ${
                currentMachine.status === 'OPERATIVA'
                  ? 'bg-emerald-600 text-white'
                  : currentMachine.status === 'EN_REVISION'
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-600 text-white'
              }`}>
                {currentMachine.status}
              </span>
            </div>
          )}

          {/* TWO MAIN CHOICES TABS / CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Choice A: Direct Link */}
            <div className="p-3.5 bg-blue-50/70 border-2 border-blue-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900 text-xs">Opción A: Link Directo</h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Copia el enlace para abrir {selectedCode} en cualquier dispositivo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>

            {/* Choice B: Write to NFC Tag */}
            <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <Radio className="w-4 h-4 text-cyan-200 animate-pulse" />
                </div>
                <h4 className="font-black text-slate-900 text-xs">Opción B: Grabar en NFC</h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Escribe la URL directamente en el chip o etiqueta física con tu teléfono.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWriteNfc}
                disabled={nfcWriting}
                className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{nfcWriting ? 'Acerca el Tag...' : `Grabar ${selectedCode}`}</span>
              </button>
            </div>

          </div>

          {/* Generated Link Display Box */}
          <div className="space-y-1.5 bg-slate-900 rounded-2xl p-3.5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> URL permanente para el Tag NFC:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{selectedCode}</span>
            </div>
            
            <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-[11px] text-cyan-200 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{tagUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer shrink-0"
                title="Copiar"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
              <span>Al tocar el tag con cualquier móvil abrirá directamente {selectedCode}.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(tagUrl, '_blank');
                    }
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Probar</span>
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.share({
                        title: `Máquina ${currentMachine?.code}`,
                        text: `Acceso a ficha técnica de ${currentMachine?.name}`,
                        url: tagUrl,
                      }).catch(() => {});
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Compartir</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* NFC Feedback status */}
          {nfcStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] font-bold text-blue-950 flex items-start gap-2">
              <Radio className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{nfcStatus}</span>
            </div>
          )}

          {/* NFC Tools App Method */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-[11px]">
              <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>¿Cómo grabar con la app gratuita "NFC Tools" (Android / iPhone)?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-600">
              <li>Pulsa <strong>"Copiar Enlace"</strong> arriba.</li>
              <li>Abre la app <strong>NFC Tools</strong> en tu celular.</li>
              <li>Toca en <strong>Escribir</strong> (<em>Write</em>) → <strong>Añadir un registro</strong> → <strong>URL / Enlace web</strong>.</li>
              <li>Pega el enlace y pulsa <strong>Escribir</strong>; luego acerca la etiqueta física a la parte trasera del celular.</li>
            </ol>
          </div>

        </div>

        <div className="flex items-center justify-between p-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open(tagUrl, '_blank');
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir en nueva pestaña</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
