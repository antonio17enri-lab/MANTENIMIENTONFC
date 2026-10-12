import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  Award,
  ChevronRight,
  Filter,
  ExternalLink,
  PieChart as PieIcon,
  BarChart2,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { Machine, PlantStation } from '../types';

interface DashboardIndicadoresProps {
  machines: Machine[];
  stations: PlantStation[];
  onSelectMachine: (machineId: string) => void;
  selectedMachineId: string;
}

export const DashboardIndicadores: React.FC<DashboardIndicadoresProps> = ({
  machines,
  stations,
  onSelectMachine,
  selectedMachineId,
}) => {
  const [stationFilter, setStationFilter] = useState<string>('all');

  // Compute live statistics based on machines array
  const totalMachines = machines.length;
  const upToDate = machines.filter(m => m.status === 'OPERATIVA').length;
  const pendingSoon = machines.filter(m => m.status === 'EN_REVISION').length;
  const overdueOrFailed = machines.filter(m => m.status === 'PARADA_FALLA').length;

  // Percentage calculations
  const upToDatePct = totalMachines ? Math.round((upToDate / totalMachines) * 100) : 70;
  const pendingSoonPct = totalMachines ? Math.round((pendingSoon / totalMachines) * 100) : 20;
  const overduePct = totalMachines ? Math.round((overdueOrFailed / totalMachines) * 100) : 10;

  // Average 5S
  const avg5S = Math.round(
    machines.reduce((acc, m) => acc + m.latest5S.generalCompliance, 0) / (machines.length || 1)
  );

  // Financial & Budget Aggregates
  const totalPlantBudget = machines.reduce(
    (acc, m) => acc + (m.financials?.maintenanceBudget ?? 3500),
    0
  );
  const totalPlantSpent = machines.reduce((acc, m) => {
    const machineSpent = (m.maintenanceHistory || []).reduce((s, r) => s + (r.cost || 0), 0);
    return acc + machineSpent;
  }, 0);
  const totalBudgetAvailable = totalPlantBudget - totalPlantSpent;

  // Count machines with replacement warning (> 70% of new machine cost)
  const machinesNeedingReplacementEval = machines.filter((m) => {
    const spent = (m.maintenanceHistory || []).reduce((s, r) => s + (r.cost || 0), 0);
    const replacementCost = m.financials?.replacementEstimatedCost ?? 25000;
    const threshold = m.financials?.replacementAlertThresholdPct ?? 70;
    return replacementCost > 0 && (spent / replacementCost) * 100 >= threshold;
  });

  // Count machines with budget exceeded
  const machinesOverBudget = machines.filter((m) => {
    const spent = (m.maintenanceHistory || []).reduce((s, r) => s + (r.cost || 0), 0);
    const budget = m.financials?.maintenanceBudget ?? 3500;
    return spent > budget;
  });

  // Failure categories breakdown
  const failureStats = [
    { type: 'Mecánicas', pct: 45, count: 9, color: '#3b82f6', bgClass: 'bg-blue-500' },
    { type: 'Eléctricas', pct: 25, count: 5, color: '#f97316', bgClass: 'bg-orange-500' },
    { type: 'Hidráulicas', pct: 15, count: 3, color: '#10b981', bgClass: 'bg-emerald-500' },
    { type: 'Otras', pct: 15, count: 3, color: '#94a3b8', bgClass: 'bg-slate-400' },
  ];

  // Upcoming maintenance list (sorted by next revision date)
  const upcomingList = [...machines].sort((a, b) => {
    return new Date(a.nextRevisionDate).getTime() - new Date(b.nextRevisionDate).getTime();
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col gap-6 w-full max-w-full min-w-0 overflow-hidden">
      {/* Dashboard Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
            DASHBOARD DE INDICADORES
          </h2>
          <p className="text-xs text-slate-500">
            Monitoreo en tiempo real de disponibilidad de activos, mantenimiento preventivo y auditorías 5S
          </p>
        </div>

        {/* Station Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Todas las Estaciones (Planta Completa)</option>
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 KPI Cards (exact replica of infographic top cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Mantenimiento al día */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 text-center hover:border-emerald-300 transition-colors shadow-2xs">
          <span className="text-xs font-bold text-slate-700 block mb-1">
            Mantenimiento al día
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight my-0.5">
            {upToDate}
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block">
            {upToDatePct}%
          </span>
        </div>

        {/* Card 2: Próximos a vencer */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 text-center hover:border-amber-300 transition-colors shadow-2xs">
          <span className="text-xs font-bold text-slate-700 block mb-1">
            Próximos a vencer
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tight my-0.5">
            {pendingSoon}
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full inline-block">
            {pendingSoonPct}%
          </span>
        </div>

        {/* Card 3: Mantenimiento vencido */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 text-center hover:border-rose-300 transition-colors shadow-2xs">
          <span className="text-xs font-bold text-slate-700 block mb-1">
            Mantenimiento vencido
          </span>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight my-0.5">
            {overdueOrFailed}
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full inline-block">
            {overduePct}%
          </span>
        </div>

        {/* Card 4: Cumplimiento 5S promedio */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 text-center hover:border-blue-300 transition-colors shadow-2xs">
          <span className="text-xs font-bold text-slate-700 block mb-1">
            Cumplimiento 5S promedio
          </span>
          <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight my-0.5">
            {avg5S}%
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full inline-block">
            Objetivo: ≥80%
          </span>
        </div>
      </div>

      {/* Control Presupuestario y Evaluación Financiera Summary Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
                CONTROL PRESUPUESTARIO CONSOLIDADO
              </span>
              {machinesNeedingReplacementEval.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{machinesNeedingReplacementEval.length} alerta(s) de reemplazo</span>
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-300" />
              <span>Presupuesto de Mantenimiento vs Gasto Acumulado en Planta</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Monitoreo del total invertido en repuestos y mano de obra frente a la compra estimada de máquinas nuevas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0 bg-slate-950/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Ppto. Total</span>
              <span className="text-xs sm:text-sm font-black font-mono text-cyan-300">
                Q{totalPlantBudget.toLocaleString('es-GT')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Gastado Real</span>
              <span className="text-xs sm:text-sm font-black font-mono text-amber-300">
                Q{totalPlantSpent.toLocaleString('es-GT')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Disponible</span>
              <span className={`text-xs sm:text-sm font-black font-mono ${totalBudgetAvailable >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Q{totalBudgetAvailable.toLocaleString('es-GT')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Tables Section (3-column layout matching the image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Cumplimiento 5S por estación (Bar chart) */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Cumplimiento 5S por estación
            </h3>
            <p className="text-[11px] text-slate-500">Auditorías mensuales consolidadas</p>
          </div>

          <div className="space-y-3 my-2">
            {stations.map((st) => (
              <div key={st.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-700 font-semibold">{st.id}</span>
                  <span className="text-slate-900 font-bold">{st.compliance5S}%</span>
                </div>
                <div className="w-full h-4 bg-slate-200/70 rounded-xs overflow-hidden relative">
                  <div
                    className={`h-full rounded-xs transition-all duration-700 ${
                      st.compliance5S >= 85
                        ? 'bg-blue-600'
                        : st.compliance5S >= 80
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${st.compliance5S}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Scale Axis */}
          <div className="pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 2. Fallas por tipo (Donut/Pie chart matching image) */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-orange-500" />
              Fallas por tipo
            </h3>
            <p className="text-[11px] text-slate-500">Distribución de incidencias registradas</p>
          </div>

          {/* Pie Graphic Representation */}
          <div className="flex items-center justify-center my-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Conic gradient circle matching percentages */}
              <div
                className="w-32 h-32 rounded-full shadow-inner"
                style={{
                  background:
                    'conic-gradient(#3b82f6 0% 45%, #f97316 45% 70%, #10b981 70% 85%, #94a3b8 85% 100%)',
                }}
              ></div>
              {/* Donut cutout */}
              <div className="absolute w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                <span className="text-xs font-black text-slate-800">20</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
            {failureStats.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.bgClass} shrink-0`}></span>
                <span className="text-slate-600 font-medium truncate">{item.type}</span>
                <span className="font-bold text-slate-900 ml-auto">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mantenimientos próximos (Table matching image) */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              Mantenimientos próximos
            </h3>
            <p className="text-[11px] text-slate-500">Calendario de intervenciones programadas</p>
          </div>

          <div className="space-y-1.5 my-1 overflow-y-auto max-h-[190px]">
            {upcomingList.map((m) => {
              const formattedDate = m.nextRevisionDate.split('-').reverse().join('/');
              const isSelected = selectedMachineId === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMachine(m.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 font-bold text-blue-900'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      {m.code}
                    </span>
                    <span className="truncate max-w-[100px] text-slate-600 font-medium">
                      {m.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-slate-800">{formattedDate}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Haz clic para cargar en el móvil</span>
            <span className="font-bold text-blue-600">Ver activo</span>
          </div>
        </div>

      </div>
    </div>
  );
};
