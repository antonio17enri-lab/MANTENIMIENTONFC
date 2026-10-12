import React, { useState } from 'react';
import { Clock, Play, Pause, TrendingUp, AlertTriangle, Plus, Check, Calendar, User, FileText, BarChart2 } from 'lucide-react';
import { Machine, ProductionLog } from '../types';

interface ProductionOperationViewProps {
  machine: Machine;
  onSaveProductionLog: (log: ProductionLog) => void;
}

export const ProductionOperationView: React.FC<ProductionOperationViewProps> = ({
  machine,
  onSaveProductionLog,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Default initial or calculated metrics
  const availableHours = machine.productionMetrics?.availableHours ?? 160;
  const workedHours = machine.productionMetrics?.workedHours ?? 135;
  const stoppedHours = machine.productionMetrics?.stoppedHours ?? 25;
  const producedUnits = machine.productionMetrics?.producedUnits ?? 540;

  // Calculated values
  const productionPerHour = workedHours > 0 ? (producedUnits / workedHours).toFixed(1) : '0.0';
  const utilizationRate = availableHours > 0 ? ((workedHours / availableHours) * 100).toFixed(1) : '0.0';

  // Form states for new shift log
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logWorkedHours, setLogWorkedHours] = useState(7.5);
  const [logStoppedHours, setLogStoppedHours] = useState(0.5);
  const [stopReason, setStopReason] = useState('Ajuste de herramienta');
  const [logUnits, setLogUnits] = useState(30);
  const [operator, setOperator] = useState(machine.responsible || 'Operario de turno');
  const [notes, setNotes] = useState('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: ProductionLog = {
      id: `prod-${Date.now()}`,
      date,
      hoursWorked: Number(logWorkedHours),
      hoursStopped: Number(logStoppedHours),
      stopReason: Number(logStoppedHours) > 0 ? stopReason : 'Ninguno',
      unitsProduced: Number(logUnits),
      expectedUnits: Math.round(Number(logWorkedHours) * 4.0),
      operator,
      notes,
    };

    onSaveProductionLog(newLog);
    setShowAddModal(false);
    setNotes('');
  };

  const logs = machine.productionHistory || [];

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-cyan-300 text-sm">{machine.code}</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-sm text-slate-100">{machine.name}</span>
          </div>
          <h2 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Horas de Operación y Producción</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Conecta mantenimiento, horas de paro y rendimiento productivo
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Turno / Horas</span>
        </button>
      </div>

      {/* KPI Cards Grid (Matches User Specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        
        {/* Horas disponibles */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Horas Disponibles
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{availableHours}</span>
            <span className="text-xs font-bold text-slate-500">h</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Capacidad nominal mensual</span>
        </div>

        {/* Horas trabajadas */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
            <Play className="w-3 h-3" /> Horas Trabajadas
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-700 font-mono">{workedHours}</span>
            <span className="text-xs font-bold text-emerald-600">h</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, (workedHours / availableHours) * 100)}%` }}
            />
          </div>
        </div>

        {/* Horas detenidas */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block flex items-center gap-1">
            <Pause className="w-3 h-3" /> Horas Detenidas
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-rose-600 font-mono">{stoppedHours}</span>
            <span className="text-xs font-bold text-rose-500">h</span>
          </div>
          <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
            {stoppedHours > 0 ? 'Afecta la producción del mes' : 'Sin paros reportados'}
          </span>
        </div>

        {/* Producción */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block flex items-center gap-1">
            <BarChart2 className="w-3 h-3" /> Producción Total
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{producedUnits}</span>
            <span className="text-xs font-bold text-blue-600">unid</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Piezas conformadas</span>
        </div>

        {/* Producción / hora */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
            Producción / Hora
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-indigo-700 font-mono">{productionPerHour}</span>
            <span className="text-xs font-bold text-slate-500">unid/h</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Ritmo promedio del equipo</span>
        </div>

        {/* Utilización */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-600" /> Utilización
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{utilizationRate}%</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
            {Number(utilizationRate) >= 80 ? '🟢 Eficiencia óptima' : '🟡 Margen de mejora'}
          </span>
        </div>

      </div>

      {/* Industrial Insight Card: Why it connects maintenance & production */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200/80 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
          ⚙️
        </div>
        <div className="text-xs">
          <span className="font-bold text-slate-900 block">
            Impacto Industrial en Tiempo Real
          </span>
          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
            TAG OPS no solo registra que la máquina tuvo mantenimiento: relaciona directamente las{' '}
            <strong className="text-slate-900">{stoppedHours} horas de paro</strong> con la pérdida de volumen productivo, permitiendo calcular el impacto financiero exacto en las finanzas del taller.
          </p>
        </div>
      </div>

      {/* History of Shift & Production Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Historial de Turnos y Motivos de Paro</span>
          </span>
          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
            {logs.length} turnos registrados
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No hay turnos registrados aún. Haz clic en <strong>"Registrar Turno / Horas"</strong> para ingresar el primer turno de esta máquina.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50/50 transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {log.date}
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> {log.operator}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Trabajadas: {log.hoursWorked}h
                    </span>
                    {log.hoursStopped > 0 && (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Paro: {log.hoursStopped}h ({log.stopReason})
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-slate-500 text-[10px] italic">{log.notes}</p>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {log.unitsProduced} unid
                    </span>
                    <span className="text-[10px] text-slate-400 block">producidas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal to Register a Shift / Operation Hours */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Registrar Turno / Horas de Operación</h3>
                  <p className="text-[11px] text-slate-400">{machine.code} - {machine.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fecha del Turno</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Operador a cargo</label>
                  <input
                    type="text"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="Nombre del operario"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-700">Horas Trabajadas (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={logWorkedHours}
                    onChange={(e) => setLogWorkedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 font-mono text-xs bg-emerald-50/30"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-rose-700">Horas Detenidas / Paro (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={logStoppedHours}
                    onChange={(e) => setLogStoppedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 font-mono text-xs bg-rose-50/30"
                    required
                  />
                </div>
              </div>

              {logStoppedHours > 0 && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Motivo de Paro</label>
                  <select
                    value={stopReason}
                    onChange={(e) => setStopReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                  >
                    <option value="Falla mecánica">Falla mecánica</option>
                    <option value="Falla eléctrica">Falla eléctrica</option>
                    <option value="Mantenimiento preventivo">Mantenimiento preventivo</option>
                    <option value="Ajuste de herramienta">Ajuste de herramienta / Set-up</option>
                    <option value="Falta de materia prima">Falta de materia prima</option>
                    <option value="Esperando operario">Esperando operario / relevo</option>
                    <option value="Limpieza y orden (5S)">Limpieza y orden (5S)</option>
                    <option value="Otro motivo">Otro motivo</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-blue-700">Unidades Producidas en el Turno</label>
                <input
                  type="number"
                  min="0"
                  value={logUnits}
                  onChange={(e) => setLogUnits(Number(e.target.value))}
                  placeholder="ej. 30"
                  className="w-full px-3 py-2 rounded-xl border border-blue-300 font-mono text-xs bg-blue-50/30 font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Observaciones del Turno (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ej. Se realizó cambio de inserto a mitad de turno..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs h-16 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Turno</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
