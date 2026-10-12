import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calculator,
  BarChart3,
  HelpCircle,
  PiggyBank,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Package,
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { Machine, BreakEvenConfig, OperationalBudget, MaintenanceRecord } from '../types';

interface FinancialModuleProps {
  machine?: Machine;
  allMachines?: Machine[];
  onUpdateMachineFinancials?: (machineId: string, updatedFields: Partial<NonNullable<Machine['financials']>>) => void;
  onOpenMaintenanceModal?: () => void;
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({
  machine,
  allMachines = [],
  onUpdateMachineFinancials,
  onOpenMaintenanceModal,
}) => {
  // Navigation tabs within Financials
  const [activeTab, setActiveTab] = useState<'presupuesto' | 'reemplazo' | 'punto_equilibrio' | 'flujo_caja'>('presupuesto');

  // Currency
  const currencySymbol = 'Q';

  // 1. Break-Even Inputs dynamically loaded from the machine (fallback to defaults)
  const [fixedCosts, setFixedCosts] = useState<number>(machine?.financials?.monthlyFixedCost ?? 15000);
  const [salePrice, setSalePrice] = useState<number>(machine?.financials?.salePricePerUnit ?? 50);
  const [variableCost, setVariableCost] = useState<number>(machine?.financials?.variableCostPerUnit ?? 25);

  // 2. Budget and Replacement Inputs (per machine)
  const [maintenanceBudget, setMaintenanceBudget] = useState<number>(machine?.financials?.maintenanceBudget ?? 4500);
  const [replacementEstimatedCost, setReplacementEstimatedCost] = useState<number>(machine?.financials?.replacementEstimatedCost ?? 25000);
  const [alertThresholdPct, setAlertThresholdPct] = useState<number>(machine?.financials?.replacementAlertThresholdPct ?? 70);

  // Synchronize when machine changes
  React.useEffect(() => {
    if (machine) {
      setFixedCosts(machine.financials?.monthlyFixedCost ?? 15000);
      setSalePrice(machine.financials?.salePricePerUnit ?? 50);
      setVariableCost(machine.financials?.variableCostPerUnit ?? 25);
      setMaintenanceBudget(machine.financials?.maintenanceBudget ?? 4500);
      setReplacementEstimatedCost(machine.financials?.replacementEstimatedCost ?? 25000);
      setAlertThresholdPct(machine.financials?.replacementAlertThresholdPct ?? 70);
    }
  }, [machine?.id, machine?.financials]);

  // Operational Budget Inputs (defaults to user prompt values)
  const [budget, setBudget] = useState<OperationalBudget>({
    revenue: 45000,
    rawMaterial: 15000,
    labor: 10000,
    maintenance: 3000,
    energy: 4000,
    otherExpenses: 2000,
    currencySymbol: 'Q',
  });

  // Calculate actual maintenance expenses from history
  const history: MaintenanceRecord[] = machine?.maintenanceHistory || [];
  
  // Total maintenance spend
  const totalSpentMaintenance = history.reduce((acc, item) => acc + (item.cost || 0), 0);
  
  // Breakdown: Parts, Labor, Other
  const totalPartsCost = history.reduce((acc, item) => {
    if (item.partsCost !== undefined) return acc + item.partsCost;
    // Estimate fallback: ~50% of cost if partsReplaced exist
    return acc + (item.partsReplaced && item.partsReplaced.length > 0 ? (item.cost || 0) * 0.55 : 0);
  }, 0);

  const totalLaborCost = history.reduce((acc, item) => {
    if (item.laborCost !== undefined) return acc + item.laborCost;
    return acc + (item.durationHours ? item.durationHours * 25 : (item.cost || 0) * 0.35);
  }, 0);

  const totalOtherCost = Math.max(0, totalSpentMaintenance - totalPartsCost - totalLaborCost);

  // Budget calculations
  const budgetAvailable = maintenanceBudget - totalSpentMaintenance;
  const budgetVariance = totalSpentMaintenance - maintenanceBudget; // > 0 means over budget
  const budgetUsagePct = maintenanceBudget > 0 ? Math.round((totalSpentMaintenance / maintenanceBudget) * 100) : 0;

  // Replacement evaluation calculations
  const replacementRatioPct = replacementEstimatedCost > 0
    ? Math.round((totalSpentMaintenance / replacementEstimatedCost) * 100)
    : 0;
  
  const isOverReplacementThreshold = replacementRatioPct >= alertThresholdPct;
  const isExceededReplacementCost = totalSpentMaintenance >= replacementEstimatedCost;
  const isOverBudget = totalSpentMaintenance > maintenanceBudget;

  // Save budget / replacement parameters
  const handleSaveBudgetConfig = () => {
    if (machine && onUpdateMachineFinancials) {
      onUpdateMachineFinancials(machine.id, {
        maintenanceBudget,
        replacementEstimatedCost,
        replacementAlertThresholdPct: alertThresholdPct,
        monthlyFixedCost: fixedCosts,
        salePricePerUnit: salePrice,
        variableCostPerUnit: variableCost,
      });
    }
  };

  // Production metrics
  const currentUnits = machine?.productionMetrics?.producedUnits ?? 540;
  const expectedUnits = machine?.productionMetrics?.expectedUnits ?? 600;
  const stoppedHours = machine?.productionMetrics?.stoppedHours ?? 25;

  // Mathematical calculations for Break-Even
  const contributionMargin = Math.max(0.1, salePrice - variableCost);
  const contributionRatio = salePrice > 0 ? (contributionMargin / salePrice) * 100 : 0;
  const breakEvenUnits = contributionMargin > 0 ? Math.round(fixedCosts / contributionMargin) : 0;
  const breakEvenSales = breakEvenUnits * salePrice;
  const percentOfBreakEven = breakEvenUnits > 0 ? (currentUnits / breakEvenUnits) * 100 : 100;

  // Cash flow budget
  const totalExpenses =
    budget.rawMaterial + budget.labor + budget.maintenance + budget.energy + budget.otherExpenses;
  const netCashFlow = budget.revenue - totalExpenses;

  // Lost units and downtime cost
  const unitsLost = Math.max(0, expectedUnits - currentUnits);
  const downtimeFinancialImpact = unitsLost * contributionMargin;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      
      {/* Top Banner with Machine Info and Navigation Tabs */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider font-mono">
                GESTIÓN FINANCIERA DEL MANTENIMIENTO
              </span>
              {machine && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {machine.code} • {machine.name}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
              <PiggyBank className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>Control Presupuestario y Evaluación Financiera</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monitorea los costos de mantenimiento (repuestos, mano de obra y otros), compara contra el presupuesto y evalúa la viabilidad de reemplazo vs compra de máquina nueva.
            </p>
          </div>

          {/* Quick Critical Alert Pills */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            {isOverBudget ? (
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-500 text-white flex items-center gap-1.5 shadow-sm animate-pulse">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>PRESUPUESTO EXCEDIDO (+Q{Math.abs(budgetVariance).toLocaleString('es-GT')})</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Presupuesto Bajo Control ({budgetUsagePct}%)</span>
              </span>
            )}

            {isOverReplacementThreshold && (
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>EVALUAR REEMPLAZO ({replacementRatioPct}% de nueva)</span>
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('presupuesto')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presupuesto'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4 text-cyan-300" />
            <span>1. Control Presupuestario</span>
          </button>

          <button
            onClick={() => setActiveTab('reemplazo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reemplazo'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-amber-300" />
            <span>2. Evaluación de Reemplazo (Reparar vs Comprar)</span>
          </button>

          <button
            onClick={() => setActiveTab('punto_equilibrio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'punto_equilibrio'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>3. Punto de Equilibrio</span>
          </button>

          <button
            onClick={() => setActiveTab('flujo_caja')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'flujo_caja'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-300" />
            <span>4. Flujo de Caja Operativo</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONTROL PRESUPUESTARIO DE MANTENIMIENTO                           */}
      {/* ========================================================================= */}
      {activeTab === 'presupuesto' && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Main Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Presupuesto Asignado */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Presupuesto Establecido</span>
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {currencySymbol}{maintenanceBudget.toLocaleString('es-GT')}
              </div>
              <span className="text-[10px] text-slate-500 block">Límite programado para {machine?.code || 'máquina'}</span>
            </div>

            {/* Total Gastado Real */}
            <div className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${
              isOverBudget ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Gasto Real Acumulado</span>
                <Wrench className={`w-4 h-4 ${isOverBudget ? 'text-rose-600' : 'text-amber-600'}`} />
              </div>
              <div className={`text-2xl font-black font-mono ${isOverBudget ? 'text-rose-700' : 'text-slate-900'}`}>
                {currencySymbol}{totalSpentMaintenance.toLocaleString('es-GT')}
              </div>
              <span className={`text-[10px] font-bold block ${isOverBudget ? 'text-rose-600' : 'text-slate-500'}`}>
                {history.length} intervenciones registradas
              </span>
            </div>

            {/* Presupuesto Disponible / Saldo */}
            <div className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${
              budgetAvailable >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  budgetAvailable >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  Presupuesto Disponible
                </span>
                {budgetAvailable >= 0 ? (
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div className={`text-2xl font-black font-mono ${
                budgetAvailable >= 0 ? 'text-emerald-950' : 'text-rose-700'
              }`}>
                {currencySymbol}{budgetAvailable.toLocaleString('es-GT')}
              </div>
              <span className={`text-[10px] font-bold block ${
                budgetAvailable >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {budgetAvailable >= 0 ? 'Saldo a favor para nuevas órdenes' : 'Sobrepasó el presupuesto asignado'}
              </span>
            </div>

            {/* Variación / Porcentaje de Uso */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">% Consumo Presupuesto</span>
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${
                  budgetUsagePct > 100 ? 'text-rose-600' : budgetUsagePct > 80 ? 'text-amber-600' : 'text-indigo-600'
                }`}>
                  {budgetUsagePct}%
                </span>
                <span className="text-[10px] text-slate-500">utilizado</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsagePct > 100 ? 'bg-rose-600' : budgetUsagePct > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, budgetUsagePct)}%` }}
                />
              </div>
            </div>

          </div>

          {/* Alert Banner when Budget Exceeded */}
          {isOverBudget && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-950 flex-1">
                <strong className="font-bold text-rose-800 text-sm block">
                  ⚠️ Alerta Presupuestaria: Límite de Mantenimiento Superado en {machine?.code}
                </strong>
                El gasto real acumulado ({currencySymbol}{totalSpentMaintenance.toLocaleString('es-GT')}) supera el presupuesto asignado ({currencySymbol}{maintenanceBudget.toLocaleString('es-GT')}) por un monto de <strong>{currencySymbol}{Math.abs(budgetVariance).toLocaleString('es-GT')} ({Math.round(budgetUsagePct - 100)}% de sobregiro)</strong>. Se recomienda auditar las órdenes de trabajo correctivas o realizar una revisión gerencial de partidas.
              </div>
            </div>
          )}

          {/* Breakdown Section: Repuestos, Mano de Obra, Otros */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Desglose de Gastos de Mantenimiento</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Distribución detallada de inversión en repuestos, mano de obra y costos complementarios
                </p>
              </div>

              {onOpenMaintenanceModal && (
                <button
                  onClick={onOpenMaintenanceModal}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>+ Registrar Intervención / Gasto</span>
                </button>
              )}
            </div>

            <div className="p-5 space-y-5 text-xs">
              
              {/* Cost Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Repuestos e Insumos */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                    🔩 Repuestos e Insumos
                  </span>
                  <div className="text-xl font-black text-blue-950 font-mono">
                    {currencySymbol}{totalPartsCost.toLocaleString('es-GT')}
                  </div>
                  <span className="text-[10px] text-blue-700 block">
                    {totalSpentMaintenance > 0 ? ((totalPartsCost / totalSpentMaintenance) * 100).toFixed(1) : 0}% del total gastado
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Rodamientos, retenes, filtros, correas, lubricantes
                  </span>
                </div>

                {/* 2. Mano de Obra */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    👷 Mano de Obra Técnica
                  </span>
                  <div className="text-xl font-black text-amber-950 font-mono">
                    {currencySymbol}{totalLaborCost.toLocaleString('es-GT')}
                  </div>
                  <span className="text-[10px] text-amber-700 block">
                    {totalSpentMaintenance > 0 ? ((totalLaborCost / totalSpentMaintenance) * 100).toFixed(1) : 0}% del total gastado
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Horas hombre de técnicos mecánicos/eléctricos
                  </span>
                </div>

                {/* 3. Otros Gastos */}
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                    📦 Otros Gastos / Servicios
                  </span>
                  <div className="text-xl font-black text-purple-950 font-mono">
                    {currencySymbol}{totalOtherCost.toLocaleString('es-GT')}
                  </div>
                  <span className="text-[10px] text-purple-700 block">
                    {totalSpentMaintenance > 0 ? ((totalOtherCost / totalSpentMaintenance) * 100).toFixed(1) : 0}% del total gastado
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Tornería externa, calibración especializada, fletes
                  </span>
                </div>

              </div>

              {/* Interventions History Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Historial de Gastos de Intervenciones ({history.length})</span>
                  <span className="text-[11px] text-slate-500 font-normal">Máquina: {machine?.code}</span>
                </div>

                {history.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No hay intervenciones con gastos registrados en esta máquina.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-3.5 py-2">Fecha</th>
                          <th className="px-3.5 py-2">Tipo</th>
                          <th className="px-3.5 py-2">Descripción / Repuestos</th>
                          <th className="px-3.5 py-2">Técnico</th>
                          <th className="px-3.5 py-2 text-right">Repuestos</th>
                          <th className="px-3.5 py-2 text-right">M. Obra</th>
                          <th className="px-3.5 py-2 text-right">Costo Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map((record) => {
                          const itemParts = record.partsCost ?? (record.partsReplaced && record.partsReplaced.length > 0 ? (record.cost || 0) * 0.55 : 0);
                          const itemLabor = record.laborCost ?? (record.durationHours ? record.durationHours * 25 : (record.cost || 0) * 0.35);
                          return (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3.5 py-2 font-mono text-slate-600 whitespace-nowrap">{record.date}</td>
                              <td className="px-3.5 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  record.type === 'Preventivo' ? 'bg-blue-100 text-blue-800' :
                                  record.type === 'Correctivo' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {record.type}
                                </span>
                              </td>
                              <td className="px-3.5 py-2 max-w-xs">
                                <div className="font-semibold text-slate-800 truncate">{record.description}</div>
                                {record.partsReplaced && record.partsReplaced.length > 0 && (
                                  <div className="text-[10px] text-slate-500 font-mono truncate">
                                    Piezas: {record.partsReplaced.join(', ')}
                                  </div>
                                )}
                              </td>
                              <td className="px-3.5 py-2 text-slate-600">{record.technician}</td>
                              <td className="px-3.5 py-2 text-right font-mono text-slate-600">
                                {currencySymbol}{itemParts.toFixed(2)}
                              </td>
                              <td className="px-3.5 py-2 text-right font-mono text-slate-600">
                                {currencySymbol}{itemLabor.toFixed(2)}
                              </td>
                              <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                                {currencySymbol}{(record.cost || 0).toLocaleString('es-GT')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Budget Parameters Adjustment Card */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block text-xs">
                    ⚙️ Ajustar Presupuesto Asignado de {machine?.code}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Modifica el tope presupuestario de mantenimiento asignado para este equipo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 font-bold text-slate-400 text-xs">Q</span>
                    <input
                      type="number"
                      value={maintenanceBudget}
                      onChange={(e) => setMaintenanceBudget(Number(e.target.value))}
                      className="w-32 pl-7 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveBudgetConfig}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Guardar
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EVALUACIÓN DE REEMPLAZO (REPARAR VS COMPRAR MÁQUINA NUEVA)       */}
      {/* ========================================================================= */}
      {activeTab === 'reemplazo' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>Evaluación de Reemplazo: Costo Acumulado vs Máquina Nueva</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Compara cuánto dinero se ha invertido en mantener la máquina contra el costo de adquirir una unidad de reemplazo
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-xl text-xs font-bold">
                <span>Alerta definida al: {alertThresholdPct}%</span>
              </div>
            </div>

            <div className="p-5 space-y-6 text-xs">

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                {/* 1. Costo Acumulado de Mantenimiento */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Costo Acumulado en Mantenimiento
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {currencySymbol}{totalSpentMaintenance.toLocaleString('es-GT')}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Suma total invertida desde puesta en marcha
                  </span>
                </div>

                {/* 2. Costo Estimado de Máquina Nueva */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                    Costo Estimado de Reemplazo (Máquina Nueva)
                  </span>
                  <div className="text-2xl font-black text-blue-950 font-mono">
                    {currencySymbol}{replacementEstimatedCost.toLocaleString('es-GT')}
                  </div>
                  <span className="text-[10px] text-blue-700 block">
                    Valor de reposición o adquisición en mercado
                  </span>
                </div>

                {/* 3. Ratio Mantenimiento / Reemplazo */}
                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isOverReplacementThreshold
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isOverReplacementThreshold ? 'text-amber-900' : 'text-emerald-900'
                  }`}>
                    Relación Costo Mantenimiento / Nueva
                  </span>
                  <div className={`text-2xl font-black font-mono ${
                    isOverReplacementThreshold ? 'text-amber-800' : 'text-emerald-950'
                  }`}>
                    {replacementRatioPct}%
                  </div>
                  <span className={`text-[10px] font-bold block ${
                    isOverReplacementThreshold ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {isOverReplacementThreshold
                      ? '⚠️ Superó el umbral crítico recomendado'
                      : '✓ Nivel de inversión justificado'}
                  </span>
                </div>

              </div>

              {/* Visual Replacement Progress Meter */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">
                    Termómetro de Viabilidad de Reemplazo
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {totalSpentMaintenance.toLocaleString('es-GT')} de {replacementEstimatedCost.toLocaleString('es-GT')} ({replacementRatioPct}%)
                  </span>
                </div>

                {/* Progress bar with alert threshold marker */}
                <div className="relative pt-3 pb-2">
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isExceededReplacementCost
                          ? 'bg-rose-500'
                          : isOverReplacementThreshold
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, replacementRatioPct)}%` }}
                    />
                  </div>

                  {/* Marker for threshold */}
                  <div
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${alertThresholdPct}%` }}
                  >
                    <div className="h-7 w-0.5 bg-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300 font-mono mt-0.5">
                      Límite {alertThresholdPct}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                  <span>0% (Equipo Nuevo)</span>
                  <span className="text-amber-300 font-bold">Umbral de Evaluación ({alertThresholdPct}%)</span>
                  <span>100% (Costo iguala máquina nueva)</span>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 ${
                isExceededReplacementCost
                  ? 'bg-rose-50 border-rose-400 text-rose-950'
                  : isOverReplacementThreshold
                  ? 'bg-amber-50 border-amber-400 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                {isExceededReplacementCost ? (
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : isOverReplacementThreshold ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 text-xs">
                  <strong className="text-sm font-black block">
                    {isExceededReplacementCost
                      ? '🛑 Dictamen Financiero: REEMPLAZO INMEDIATO RECOMENDADO'
                      : isOverReplacementThreshold
                      ? '⚠️ Dictamen Financiero: EVALUACIÓN DE REEMPLAZO ACONSEJADA'
                      : '✅ Dictamen Financiero: MANTENIMIENTO ECONÓMICAMENTE FACTIBLE'}
                  </strong>
                  <p className="leading-relaxed">
                    {isExceededReplacementCost
                      ? `El mantenimiento acumulado (${currencySymbol}${totalSpentMaintenance.toLocaleString('es-GT')}) ya supera el 100% del costo de una máquina nueva (${currencySymbol}${replacementEstimatedCost.toLocaleString('es-GT')}). Continuar reparando genera pérdidas continuas de capital y paros que destruyen el margen operativo.`
                      : isOverReplacementThreshold
                      ? `Los gastos acumulados han alcanzado el ${replacementRatioPct}% del valor de un equipo nuevo, superando el límite seguro del ${alertThresholdPct}%. Es momento de solicitar cotizaciones de reemplazo, calcular el ROI y comparar las garantías tecnológicas de un equipo moderno.`
                      : `Los gastos acumulados (${currencySymbol}${totalSpentMaintenance.toLocaleString('es-GT')}) representan el ${replacementRatioPct}% del costo de reemplazo, muy por debajo del límite de alerta del ${alertThresholdPct}%. Continuar con el programa preventivo actual es la decisión más rentable.`}
                  </p>
                </div>
              </div>

              {/* Configuration Inputs for this Machine */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="font-bold text-slate-800 text-xs block">
                  ⚙️ Parámetros de Comparación para {machine?.code}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Costo Estimado de Máquina Nueva (Q)
                    </label>
                    <input
                      type="number"
                      value={replacementEstimatedCost}
                      onChange={(e) => setReplacementEstimatedCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Umbral de Alerta de Evaluación (%)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={alertThresholdPct}
                      onChange={(e) => setAlertThresholdPct(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSaveBudgetConfig}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Actualizar Parámetros
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PUNTO DE EQUILIBRIO                                                */}
      {/* ========================================================================= */}
      {activeTab === 'punto_equilibrio' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  💰
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Análisis de Punto de Equilibrio</h3>
                  <p className="text-[11px] text-slate-500">
                    Nivel de producción y ventas donde los ingresos igualan los costos (sin ganancia ni pérdida)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5 text-xs">
              
              {/* User Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Costos Fijos Mensuales</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">Q</span>
                    <input
                      type="number"
                      value={fixedCosts}
                      onChange={(e) => setFixedCosts(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="15000"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Alquiler, sueldos fijos, seguros</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Precio de Venta / Unidad</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">Q</span>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="50"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Ingreso por pieza terminada</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Costo Variable / Unidad</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">Q</span>
                    <input
                      type="number"
                      value={variableCost}
                      onChange={(e) => setVariableCost(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="25"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Materia prima, insumos directos</span>
                </div>

              </div>

              {/* Results Display Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Punto de Equilibrio en Unidades */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                    Punto de Equilibrio (Volumen)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-blue-950 font-mono">{breakEvenUnits}</span>
                    <span className="text-xs font-bold text-blue-700">unidades / mes</span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-1">
                    A partir de la pieza #{breakEvenUnits + 1}, cada unidad genera Q{contributionMargin.toFixed(2)} de ganancia neta.
                  </p>
                </div>

                {/* Ventas necesarias */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                    Ventas Necesarias (Ingresos Mínimos)
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-emerald-700">Q</span>
                    <span className="text-3xl font-black text-emerald-950 font-mono">
                      {breakEvenSales.toLocaleString('es-GT')}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Margen de contribución: {contributionRatio.toFixed(0)}% (Q{contributionMargin.toFixed(2)} por unidad).
                  </p>
                </div>

              </div>

              {/* Impacto de Horas de Paro */}
              {machine && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-300 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Impacto Financiero de Paros en {machine.code}</span>
                    </span>
                    <span className="font-mono font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg text-xs">
                      Pérdida: Q{downtimeFinancialImpact.toLocaleString('es-GT')}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Las {stoppedHours} horas de paro generaron un déficit de {unitsLost} unidades respecto a la meta, con un impacto directo de Q{downtimeFinancialImpact.toLocaleString('es-GT')} en margen no percibido.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FLUJO DE CAJA OPERATIVO                                            */}
      {/* ========================================================================= */}
      {activeTab === 'flujo_caja' && (
        <div className="space-y-5 animate-fadeIn">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  📊
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Flujo de Caja y Presupuesto Operativo Mensual</h3>
                  <p className="text-[11px] text-slate-500">
                    Ingresos generados vs costos de producción, mano de obra y mantenimiento
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* Header 3 KPI Cards: Ingresos / Egresos / Saldo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center justify-between text-emerald-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ingresos del Mes</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                    Q{budget.revenue.toLocaleString('es-GT')}
                  </div>
                  <span className="text-[10px] text-emerald-700">Por producción y despachos</span>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                  <div className="flex items-center justify-between text-rose-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Egresos Totales</span>
                    <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-rose-950 font-mono mt-1">
                    Q{totalExpenses.toLocaleString('es-GT')}
                  </div>
                  <span className="text-[10px] text-rose-700">Costos operativos y mantenimiento</span>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="flex items-center justify-between text-blue-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Saldo / Flujo Neto</span>
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className={`text-2xl font-black font-mono mt-1 ${netCashFlow >= 0 ? 'text-blue-950' : 'text-rose-600'}`}>
                    Q{netCashFlow.toLocaleString('es-GT')}
                  </div>
                  <span className={`text-[10px] font-bold ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {netCashFlow >= 0 ? '✓ Flujo positivo de caja' : '⚠️ Déficit operativo'}
                  </span>
                </div>

              </div>

              {/* Editable Budget Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Concepto Operativo</th>
                      <th className="px-4 py-2.5 text-right">Monto Mensual (Q)</th>
                      <th className="px-4 py-2.5 text-right">% de Gastos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2">Materia Prima Directa</td>
                      <td className="px-4 py-2 text-right font-mono">Q{budget.rawMaterial.toLocaleString('es-GT')}</td>
                      <td className="px-4 py-2 text-right text-slate-400 font-mono">
                        {((budget.rawMaterial / totalExpenses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2">Mano de Obra Operativa</td>
                      <td className="px-4 py-2 text-right font-mono">Q{budget.labor.toLocaleString('es-GT')}</td>
                      <td className="px-4 py-2 text-right text-slate-400 font-mono">
                        {((budget.labor / totalExpenses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40 hover:bg-amber-50/70 font-semibold text-amber-950">
                      <td className="px-4 py-2">Mantenimiento y Repuestos</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-amber-900">
                        Q{budget.maintenance.toLocaleString('es-GT')}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-500 font-mono">
                        {((budget.maintenance / totalExpenses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2">Energía Eléctrica</td>
                      <td className="px-4 py-2 text-right font-mono">Q{budget.energy.toLocaleString('es-GT')}</td>
                      <td className="px-4 py-2 text-right text-slate-400 font-mono">
                        {((budget.energy / totalExpenses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2">Otros Gastos Generales</td>
                      <td className="px-4 py-2 text-right font-mono">Q{budget.otherExpenses.toLocaleString('es-GT')}</td>
                      <td className="px-4 py-2 text-right text-slate-400 font-mono">
                        {((budget.otherExpenses / totalExpenses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="px-4 py-2.5">Flujo Neto / Saldo Final</td>
                      <td className="px-4 py-2.5 text-right font-mono text-cyan-300 text-sm">
                        Q{netCashFlow.toLocaleString('es-GT')}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400 font-mono">
                        {((netCashFlow / budget.revenue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
