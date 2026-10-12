import React, { useState, useEffect, useRef } from 'react';
import { X, Radio, Smartphone, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Machine } from '../types';

interface NfcScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
  activeMachine: Machine;
}

export const NfcScannerModal: React.FC<NfcScannerModalProps> = ({
  isOpen,
  onClose,
  machines,
  onSelectMachine,
  activeMachine,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [webNfcError, setWebNfcError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setNfcSupported(true);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSimulateTap = (machine: Machine) => {
    setIsScanning(true);
    setScanSuccess(null);
    setWebNfcError(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(machine.code);
      onSelectMachine(machine.id);

      setTimeout(() => {
        handleClose();
      }, 1000);
    }, 1200);
  };

  const handleRealWebNfcScan = async () => {
    if (!('NDEFReader' in window)) {
      setWebNfcError('Web NFC no está habilitado en este navegador. Utiliza Google Chrome en Android o simula el toque abajo.');
      return;
    }

    try {
      setIsScanning(true);
      setWebNfcError(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const NDEFReaderClass = (window as unknown as { NDEFReader: new () => any }).NDEFReader;
      const ndef = new NDEFReaderClass();
      await ndef.scan({ signal: controller.signal });
      ndef.onreading = (event: any) => {
        let matchedMachine = machines[0];
        if (event.message?.records) {
          for (const record of event.message.records) {
            try {
              const textDecoder = new TextDecoder();
              const text = textDecoder.decode(record.data);
              const found = machines.find((m) => text.includes(m.code) || text.toLowerCase().includes(m.id));
              if (found) {
                matchedMachine = found;
                break;
              }
            } catch (e) {
              console.error('Error decoding NFC record:', e);
            }
          }
        }
        setIsScanning(false);
        setScanSuccess(`Tag NFC detectado: ${matchedMachine.code}`);
        onSelectMachine(matchedMachine.id);
        setTimeout(() => {
          handleClose();
        }, 1200);
      };
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setIsScanning(false);
        setWebNfcError(`Error de lectura NFC: ${err.message || 'Permiso denegado'}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            <h3 className="font-bold text-sm">Escáner de Tags NFC</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Simulated NFC Graphic (matches photo on the left) */}
        <div className="p-6 text-center bg-gradient-to-b from-blue-50/50 to-white">
          <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            {/* Ripple wave effect */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-blue-400 ${
                isScanning ? 'animate-ping' : ''
              }`}
            ></div>
            <div
              className={`absolute -inset-3 rounded-full border border-blue-200 ${
                isScanning ? 'animate-pulse' : ''
              }`}
            ></div>

            {/* Simulated Phone reading NFC tag */}
            <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white shadow-xl flex flex-col items-center justify-center relative z-10 border-2 border-blue-400">
              <Radio className={`w-8 h-8 mb-1 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-bold tracking-wider uppercase">
                {isScanning ? 'Leyendo...' : 'Listo NFC'}
              </span>
            </div>
          </div>

          <h4 className="text-base font-bold text-slate-900 mb-1">
            {isScanning ? 'Leyendo tag NFC...' : scanSuccess ? '¡Lectura exitosa!' : 'Acerca tu celular al tag NFC'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            Cada máquina posee una etiqueta pasiva NDEF en el bastidor principal.
          </p>

          {/* Status feedback */}
          {scanSuccess && (
            <div className="p-2.5 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-800 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Tag {scanSuccess} leído correctamente. Abriendo máquina...</span>
            </div>
          )}

          {webNfcError && (
            <div className="p-2.5 mb-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-xs text-amber-800 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{webNfcError}</span>
            </div>
          )}

          {/* Web NFC hardware button if available */}
          {nfcSupported && (
            <button
              onClick={handleRealWebNfcScan}
              className="w-full py-2.5 mb-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>Escanear con sensor físico Web NFC</span>
            </button>
          )}

          {/* Simulated Tags Selector */}
          <div className="text-left mt-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Toca una máquina para simular escaneo de tag:
            </span>

            <div className="grid grid-cols-2 gap-2">
              {machines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSimulateTap(m)}
                  disabled={isScanning}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeMachine.id === m.id
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-900">{m.code}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.status === 'OPERATIVA'
                          ? 'bg-emerald-500'
                          : m.status === 'EN_REVISION'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    ></span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium truncate mt-1">
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Estándar ISO 14443A / NTAG213</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
