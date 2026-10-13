import React, { useState } from 'react';
import { X, Radio, Copy, Check, QrCode, Smartphone, Sparkles } from 'lucide-react';
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
      setNfcStatus('⚠️ Tu navegador actual no soporta Web NFC directo. Te recomendamos usar la app gratuita "NFC Tools" (paso abajo).');
      return;
    }

    try {
      setNfcWriting(true);
      setNfcStatus('Acerca tu tag NFC físico a la parte trasera del celular ahora...');
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: tagUrl }],
      });
      setNfcStatus(`✅ ¡Éxito! El Tag NFC quedó grabado para abrir ${currentMachine?.code} (${currentMachine?.name}).`);
    } catch (err: any) {
      console.error(err);
      setNfcStatus('❌ No se pudo escribir. Asegúrate de tener NFC activado en los ajustes de tu celular.');
    } finally {
      setNfcWriting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Configurador de Etiquetas NFC Físicas</h3>
              <p className="text-[11px] text-slate-400">Programa tus tags para que abran cada máquina al instante</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Machine Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Selecciona la máquina que quieres vincular:</label>
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                setNfcStatus(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
              <div>
                <span className="font-black text-blue-900 text-sm font-mono">{currentMachine.code}</span>
                <p className="text-slate-600 font-semibold text-[11px]">{currentMachine.name}</p>
                <p className="text-slate-400 text-[10px]">{currentMachine.location} • Resp: {currentMachine.responsible}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full font-bold text-[10px]">
                {currentMachine.status}
              </span>
            </div>
          )}

          {/* Direct URL to write */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">URL exacta para el Tag NFC:</label>
            <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-2xl flex items-center justify-between gap-2 break-all">
              <span>{tagUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold rounded-xl flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              * Cuando grabas esta URL en el tag, cualquier celular que lo toque abrirá automáticamente esta máquina sin pasar por menús.
            </p>
          </div>

          {/* Web NFC Write option */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Grabación Directa desde el Navegador (Android)</span>
            </div>
            <p className="text-[11px] text-indigo-900">
              Si estás en Chrome para Android con NFC encendido, puedes tocar aquí y acercar tu tag:
            </p>
            <button
              type="button"
              onClick={handleWriteNfc}
              disabled={nfcWriting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{nfcWriting ? 'Esperando Tag NFC en el celular...' : `Grabar Tag para ${selectedCode}`}</span>
            </button>
            {nfcStatus && (
              <div className="p-2.5 bg-white rounded-xl border border-indigo-200 text-[11px] font-semibold text-slate-800">
                {nfcStatus}
              </div>
            )}
          </div>

          {/* NFC Tools App Method */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Instrucciones con la app gratuita "NFC Tools" (Android / iPhone)</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Instala <strong>NFC Tools</strong> desde Google Play o App Store.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Toca en la pestaña <strong>Escribir</strong> (<em>Write</em>) y luego en <strong>Añadir un registro</strong> (<em>Add a record</em>).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span>Selecciona <strong>URL / URI</strong> y pega la URL copiada arriba.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                <span>Toca <strong>Escribir</strong> y acerca el tag a tu teléfono hasta que pite.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Listo
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
