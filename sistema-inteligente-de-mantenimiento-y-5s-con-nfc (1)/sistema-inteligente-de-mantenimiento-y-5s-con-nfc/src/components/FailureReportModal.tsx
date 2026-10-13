import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Check, User } from 'lucide-react';
import { Machine, FailureReport } from '../types';
import { PhotoCapture } from './PhotoCapture';

interface FailureReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
  onSaveFailure: (failure: FailureReport, stopMachine: boolean) => void;
}

export const FailureReportModal: React.FC<FailureReportModalProps> = ({
  isOpen,
  onClose,
  machine,
  onSaveFailure,
}) => {
  const [type, setType] = useState<FailureReport['type']>('Mecánica');
  const [severity, setSeverity] = useState<FailureReport['severity']>('Media');
  const [description, setDescription] = useState<string>('');
  const [reportedBy, setReportedBy] = useState<string>(machine.responsible);
  const [stopMachine, setStopMachine] = useState<boolean>(true);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Por favor describa la falla observada.');
      return;
    }

    const [year, month, day] = new Date().toISOString().split('T')[0].split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const newFailure: FailureReport = {
      id: `fl-${machine.code}-${Date.now()}`,
      date: formattedDate,
      type,
      severity,
      description: photoUrl ? `${description} [Foto adjunta]` : description,
      reportedBy,
      status: 'Abierta',
    };

    onSaveFailure(newFailure, stopMachine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-700/60 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Reportar Falla / Incidencia</h3>
              <p className="text-[11px] text-rose-100">
                Activo: <strong className="text-white">{machine.code}</strong> - {machine.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-rose-200 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Type of Failure */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Tipo de Falla:</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['Mecánica', 'Eléctrica', 'Hidráulica', 'Neumática', 'Otras'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl border text-center font-bold transition-colors cursor-pointer text-[11px] ${
                    type === t
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Severidad / Urgencia:</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Baja', 'Media', 'Alta', 'Crítica'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setSeverity(s);
                    if (s === 'Alta' || s === 'Crítica') setStopMachine(true);
                  }}
                  className={`py-2 rounded-xl border text-center font-bold transition-colors cursor-pointer ${
                    severity === s
                      ? s === 'Crítica'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Reported By */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Operador / Quien Reporta:</label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Descripción del Síntoma o Avería:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indique ruidos anómalos, fugas, sobrecalentamiento, código de error en panel o bloqueo de ejes..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            ></textarea>
          </div>

          {/* Photo Capture */}
          <PhotoCapture
            onPhotoCaptured={(url) => setPhotoUrl(url)}
            label="Foto de la avería o fuga (Cámara / Galería)"
          />

          {/* Stop Machine Toggle */}
          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="chk-stop-machine"
              checked={stopMachine}
              onChange={(e) => setStopMachine(e.target.checked)}
              className="mt-1 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="chk-stop-machine" className="cursor-pointer text-slate-700">
              <span className="font-bold text-rose-900 block">
                Marcar máquina en estado PARADA / FALLA
              </span>
              <span className="text-[11px] text-rose-700 leading-snug block mt-0.5">
                Alerta de inmediato al equipo de mantenimiento y actualiza el dashboard de la planta.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emitir Reporte de Falla</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
