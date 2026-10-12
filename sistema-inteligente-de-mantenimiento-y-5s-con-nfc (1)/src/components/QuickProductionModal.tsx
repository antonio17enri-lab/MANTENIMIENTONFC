import React, { useState } from 'react';
import { Clock, TrendingUp, CheckCircle, AlertTriangle, X, Plus, Calendar, User, FileText, Check } from 'lucide-react';
import { Machine, ProductionLog } from '../types';

interface QuickProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
  operatorName?: string;
  onSaveProduction: (log: ProductionLog) => void;
}

export const QuickProductionModal: React.FC<QuickProductionModalProps> = ({
  isOpen,
  onClose,
  machine,
  operatorName = 'Operario',
  onSaveProduction,
}) => {
  const [units, setUnits] = useState<number>(35);
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [hoursStopped, setHoursStopped] = useState<number>(0);
  const [stopReason, setStopReason] = useState<string>('Ninguno');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentProduced = machine.productionMetrics?.producedUnits ?? 540;
  const newTotal = currentProduced + (Number(units) || 0);
  const monthlyGoal = machine.productionMetrics?.expectedUnits ?? 600;
  const breakEvenUnits =
    machine.financials && machine.financials.salePricePerUnit > machine.financials.variableCostPerUnit
      ? Math.round(
          machine.financials.monthlyFixedCost /
            (machine.financials.salePricePerUnit - machine.financials.variableCostPerUnit)
        )
      : 400;

  const isOverBreakEven = newTotal >= breakEvenUnits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: ProductionLog = {
      id: `prod-${Date.now()}`,
      date,
      hoursWorked: Number(hoursWorked) || 8,
      hoursStopped: Number(hoursStopped) || 0,
      stopReason: Number(hoursStopped) > 0 ? stopReason : 'Ninguno',
      unitsProduced: Number(units) || 0,
      expectedUnits: Math.round((Number(hoursWorked) || 8) * 4.5),
      operator: operatorName,
      notes: notes.trim() || 'Registro de producción de turno',
    };

    onSaveProduction(newLog);
    onClose();
  };

  const addPresetUnits = (amount: number) => {
    setUnits((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-cyan-300 bg-slate-800 px-2.5 py-0.5 rounded-lg text-xs border border-slate-700">
                {machine.code}
              </span>
              <span className="text-xs font-bold text-slate-300">{machine.name}</span>
            </div>
            <h2 className="text-lg font-black text-white mt-1.5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Ingresar Producción del Turno</span>
            </h2>
            <p className="text-xs text-slate-400">
              Registra las piezas fabricadas y las horas trabajadas en este turno
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Realtime Impact Preview Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Acumulado antes
              </span>
              <span className="font-black text-slate-700 text-sm font-mono">
                {currentProduced} unid
              </span>
            </div>
            <div className="text-slate-300 font-black text-base">➔</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Nuevo Acumulado
              </span>
              <span className="font-black text-blue-600 text-sm font-mono">
                {newTotal} unid
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Punto Equilibrio
              </span>
              <span
                className={`font-bold text-[11px] px-2 py-0.5 rounded-full inline-block ${
                  isOverBreakEven
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isOverBreakEven ? '🟢 Superado' : `🔴 Falta ${breakEvenUnits - newTotal}`}
              </span>
            </div>
          </div>

          {/* Units Produced Input with Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>¿Cuántas piezas / unidades se produjeron?</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Unidades</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                required
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-blue-200 rounded-2xl text-xl font-mono font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                placeholder="Ej. 35"
              />
            </div>

            {/* Quick add buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sumar rápido:</span>
              <button
                type="button"
                onClick={() => addPresetUnits(5)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => addPresetUnits(10)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => addPresetUnits(25)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                +25
              </button>
              <button
                type="button"
                onClick={() => addPresetUnits(50)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => setUnits(0)}
                className="px-2 py-1 text-slate-400 hover:text-slate-600 rounded-lg text-[11px] cursor-pointer ml-auto"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Hours Worked and Stopped */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Horas trabajadas</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                required
                value={hoursWorked}
                onChange={(e) => setHoursWorked(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Horas de paro (paro)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hoursStopped}
                onChange={(e) => setHoursStopped(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* If stopped hours > 0, ask for reason */}
          {hoursStopped > 0 && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700">
                Motivo de la detención / paro:
              </label>
              <select
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="Ajuste de herramienta">Ajuste o cambio de herramienta</option>
                <option value="Falta de materia prima">Falta de materia prima / material</option>
                <option value="Mantenimiento preventivo rápido">Mantenimiento preventivo rápido</option>
                <option value="Falla o avería mecánica">Falla o avería mecánica</option>
                <option value="Falla eléctrica">Falla eléctrica o corte de energía</option>
                <option value="Pausa de almuerzo / cambio de turno">Pausa de comida / cambio de turno</option>
                <option value="Inspección de calidad">Inspección de control de calidad</option>
              </select>
            </div>
          )}

          {/* Operator and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Operario de turno</span>
              </label>
              <input
                type="text"
                value={operatorName}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Fecha</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Notes / Work Order */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Observaciones / Lote / O.T. (opcional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Lote #B-402, torneado de ejes principales sin novedad"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Producción</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
