import React, { useState } from 'react';
import { X, Wrench, Calendar, Clock, User, Check, Plus, AlertCircle } from 'lucide-react';
import { Machine, MaintenanceRecord } from '../types';
import { PhotoCapture } from './PhotoCapture';
import { SignaturePad } from './SignaturePad';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
  onSaveMaintenance: (record: MaintenanceRecord, nextDate: string) => void;
}

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  machine,
  onSaveMaintenance,
}) => {
  const [type, setType] = useState<'Preventivo' | 'Correctivo' | 'Predictivo'>('Preventivo');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [technician, setTechnician] = useState<string>('Carlos Silva');
  const [description, setDescription] = useState<string>('');
  const [durationHours, setDurationHours] = useState<number>(3);
  const [partsCost, setPartsCost] = useState<number>(100);
  const [laborCost, setLaborCost] = useState<number>(60);
  const [otherCost, setOtherCost] = useState<number>(20);
  const [parts, setParts] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [nextDate, setNextDate] = useState<string>(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [error, setError] = useState<string | null>(null);

  const calculatedTotalCost = (Number(partsCost) || 0) + (Number(laborCost) || 0) + (Number(otherCost) || 0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Por favor detalle el trabajo realizado.');
      return;
    }

    const partsArray = parts
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    // Format display date as DD/MM/YYYY
    const [year, month, day] = date.split('-');
    const formattedDisplayDate = `${day}/${month}/${year}`;

    const newRecord: MaintenanceRecord = {
      id: `mnt-${machine.code}-${Date.now()}`,
      date: formattedDisplayDate,
      type,
      technician,
      description: photoUrl ? `${description} [Foto de mantenimiento adjunta]` : description,
      durationHours: Number(durationHours) || 1,
      cost: calculatedTotalCost,
      partsCost: Number(partsCost) || 0,
      laborCost: Number(laborCost) || 0,
      otherCost: Number(otherCost) || 0,
      partsReplaced: partsArray.length > 0 ? partsArray : undefined,
    };

    onSaveMaintenance(newRecord, nextDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-700/60 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Registrar Mantenimiento</h3>
              <p className="text-[11px] text-amber-100">
                Máquina: <strong className="text-white">{machine.code}</strong> - {machine.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-amber-200 hover:text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Tipo de Intervención:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Preventivo', 'Correctivo', 'Predictivo'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl border text-center font-bold transition-colors cursor-pointer ${
                    type === t
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dates & Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Fecha de Ejecución:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Técnico Responsable:</label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Ej. Carlos Silva"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Descripción del Trabajo Realizado:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle tareas: cambio de lubricante, calibración, verificación eléctrica, inspección de juego axial..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            ></textarea>
          </div>

          {/* Duration & Detailed Cost Breakdown */}
          <div className="space-y-2.5 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                💰 Control de Gastos de la Intervención
              </span>
              <span className="text-[10px] text-amber-800 font-medium">Moneda: Quetzales (Q)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">Duración (Horas):</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-blue-900 block mb-1 text-[11px]">Repuestos (Q):</label>
                <input
                  type="number"
                  min="0"
                  value={partsCost}
                  onChange={(e) => setPartsCost(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-blue-200 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="font-bold text-amber-900 block mb-1 text-[11px]">Mano de Obra (Q):</label>
                <input
                  type="number"
                  min="0"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-amber-200 bg-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="font-bold text-purple-900 block mb-1 text-[11px]">Otros Gastos (Q):</label>
                <input
                  type="number"
                  min="0"
                  value={otherCost}
                  onChange={(e) => setOtherCost(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-purple-200 bg-white font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Total Auto Calculated */}
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Total Inversión en Intervención:</span>
              <span className="text-base font-black text-amber-950 font-mono bg-white px-3 py-1 rounded-lg border border-amber-300">
                Q{calculatedTotalCost.toLocaleString('es-GT')}
              </span>
            </div>
          </div>

          {/* Replacement Parts */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Repuestos o Insumos Utilizados (separados por coma):
            </label>
            <input
              type="text"
              value={parts}
              onChange={(e) => setParts(e.target.value)}
              placeholder="Ej. Aceite ISO VG 68, Filtro de retorno, Correas A-42"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Photo Evidence */}
          <PhotoCapture
            onPhotoCaptured={(url) => setPhotoUrl(url)}
            label="Evidencia fotográfica del mantenimiento (Cámara / Galería)"
          />

          {/* Digital Signature */}
          <SignaturePad
            onSave={(url) => setSignatureUrl(url)}
            label="Firma de conformidad del técnico / supervisor"
          />

          {/* Next Revision Date */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-700 block mb-1">
              Próxima Revisión Programada:
            </label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Este valor actualizará automáticamente la tarjeta "Próxima revisión" y los indicadores de la planta.
            </span>
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Mantenimiento</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
