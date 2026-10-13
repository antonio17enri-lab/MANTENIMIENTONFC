import React, { useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet, Calculator, BarChart3, HelpCircle } from 'lucide-react';
import { Machine, BreakEvenConfig, OperationalBudget } from '../types';

interface FinancialModuleProps {
  machine?: Machine;
  allMachines?: Machine[];
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({
  machine,
  allMachines = [],
}) => {
  // 1. Break-Even Inputs dynamically loaded from the machine (fallback to defaults)
  const [fixedCosts, setFixedCosts] = useState<number>(machine?.financials?.monthlyFixedCost ?? 15000);
  const [salePrice, setSalePrice] = useState<number>(machine?.financials?.salePricePerUnit ?? 50);
  const [variableCost, setVariableCost] = useState<number>(machine?.financials?.variableCostPerUnit ?? 25);

  // Synchronize when machine changes
  React.useEffect(() => {
    if (machine?.financials) {
      setFixedCosts(machine.financials.monthlyFixedCost);
      setSalePrice(machine.financials.salePricePerUnit);
      setVariableCost(machine.financials.variableCostPerUnit);
    }
  }, [machine?.id, machine?.financials]);

  // 2. Operational Budget Inputs (defaults to user prompt values)
  const [budget, setBudget] = useState<OperationalBudget>({
    revenue: 45000,
    rawMaterial: 15000,
    labor: 10000,
    maintenance: 3000,
    energy: 4000,
    otherExpenses: 2000,
    currencySymbol: 'Q',
  });

  // Current machine production units
  const currentUnits = machine?.productionMetrics?.producedUnits ?? 540;
  const expectedUnits = machine?.productionMetrics?.expectedUnits ?? 600;
  const stoppedHours = machine?.productionMetrics?.stoppedHours ?? 25;

  // Mathematical calculations for Break-Even
  const contributionMargin = Math.max(0.1, salePrice - variableCost);
  const contributionRatio = salePrice > 0 ? (contributionMargin / salePrice) * 100 : 0;
  const breakEvenUnits = contributionMargin > 0 ? Math.round(fixedCosts / contributionMargin) : 0;
  const breakEvenSales = breakEvenUnits * salePrice;

  // Status relative to break-even
  const breakEvenDifference = currentUnits - breakEvenUnits;
  const percentOfBreakEven = breakEvenUnits > 0 ? (currentUnits / breakEvenUnits) * 100 : 100;

  let statusBadge = {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
    text: '🟢 Por encima del punto de equilibrio (Zona de ganancia)',
    indicator: 'profit',
  };

  if (percentOfBreakEven < 90) {
    statusBadge = {
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      dot: 'bg-rose-600',
      text: '🔴 Por debajo del punto de equilibrio (Zona de pérdida)',
      indicator: 'loss',
    };
  } else if (percentOfBreakEven <= 105) {
    statusBadge = {
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      dot: 'bg-amber-600',
      text: '🟡 Cerca del punto de equilibrio (Umbral de riesgo)',
      indicator: 'neutral',
    };
  }

  // Budget calculations
  const totalExpenses =
    budget.rawMaterial + budget.labor + budget.maintenance + budget.energy + budget.otherExpenses;
  const netCashFlow = budget.revenue - totalExpenses;

  // Downtime financial impact calculation
  // Lost units = Expected units - Real units
  const unitsLost = Math.max(0, expectedUnits - currentUnits);
  // Financial impact = Lost units * Contribution margin
  const downtimeFinancialImpact = unitsLost * contributionMargin;

  return (
    <div className="space-y-5">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider font-mono">
              FINANZAS INDUSTRIALES
            </span>
            {machine && (
              <span className="text-xs text-slate-300 font-mono">
                {machine.code} • {machine.name}
              </span>
            )}
          </div>
          <h2 className="text-lg font-black tracking-tight text-white mt-1 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Punto de Equilibrio y Flujo de Efectivo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mantenimiento → Horas de Paro → Producción → Costos → Rentabilidad
          </p>
        </div>
      </div>

      {/* SECTION 1: PUNTO DE EQUILIBRIO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              💰
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">1. Análisis de Punto de Equilibrio</h3>
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

          {/* Graphical Scale (0 - 300 - 600 - 900) as explicitly requested */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold tracking-wider uppercase text-slate-400">
                Escala de Producción Mensual (Unidades)
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                Producción Actual: {currentUnits} unid
              </span>
            </div>

            {/* Scale Bar Graphic */}
            <div className="pt-4 pb-2 px-3 relative">
              
              {/* Reference Ticks */}
              <div className="relative h-4 border-b-2 border-slate-600 flex justify-between text-[11px] font-mono text-slate-400">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-0.5 bg-slate-500 mb-1" />
                  <span>0</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-2 w-0.5 bg-slate-500 mb-1" />
                  <span>{Math.round(breakEvenUnits / 2)}</span>
                </div>
                <div className="flex flex-col items-center text-amber-400 font-bold">
                  <div className="h-3 w-1 bg-amber-400 mb-0.5" />
                  <span>{breakEvenUnits} (Eq)</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-2 w-0.5 bg-slate-500 mb-1" />
                  <span>{Math.round(breakEvenUnits * 1.5)}</span>
                </div>
              </div>

              {/* Current Position Marker Indicator */}
              <div
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{
                  left: `${Math.min(95, Math.max(5, (currentUnits / (breakEvenUnits * 1.5)) * 100))}%`,
                }}
              >
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950 shadow-md font-mono whitespace-nowrap">
                  ▼ {currentUnits} unid
                </span>
              </div>
            </div>

            {/* Dynamic Status Badge */}
            <div className="pt-2 flex items-center justify-between">
              <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-2 ${statusBadge.color}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dot} animate-pulse`} />
                <span>{statusBadge.text}</span>
              </div>

              <span className="text-[11px] text-slate-400">
                Diferencia vs Equilibrio:{' '}
                <strong className={breakEvenDifference >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                  {breakEvenDifference >= 0 ? `+${breakEvenDifference}` : breakEvenDifference} unid
                </strong>
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION 2: PRESUPUESTO OPERATIVO & FLUJO DE EFECTIVO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              💵
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">2. Presupuesto Operativo y Flujo de Efectivo</h3>
              <p className="text-[11px] text-slate-500">
                Monitoreo mensual de ingresos, egresos y saldo neto en caja
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

          {/* Breakdown Table (Concepto | Mensual) as explicitly requested */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="px-4 py-2.5">Concepto</th>
                  <th className="px-4 py-2.5 text-right">Monto Mensual (Q)</th>
                  <th className="px-4 py-2.5 text-right">% del Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                <tr className="bg-emerald-50/40 font-bold text-emerald-950">
                  <td className="px-4 py-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Ingresos por producción
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-700">
                    Q{budget.revenue.toLocaleString('es-GT')}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono">100%</td>
                </tr>

                <tr className="text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-2">Materia prima</td>
                  <td className="px-4 py-2 text-right font-mono">
                    Q{budget.rawMaterial.toLocaleString('es-GT')}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono">
                    {((budget.rawMaterial / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-2">Mano de obra directa</td>
                  <td className="px-4 py-2 text-right font-mono">
                    Q{budget.labor.toLocaleString('es-GT')}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono">
                    {((budget.labor / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="text-slate-700 bg-amber-50/30 hover:bg-amber-50/50">
                  <td className="px-4 py-2 font-semibold text-amber-900">
                    Mantenimiento (preventivo y repuestos)
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-amber-900">
                    Q{budget.maintenance.toLocaleString('es-GT')}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono">
                    {((budget.maintenance / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-2">Energía eléctrica industrial</td>
                  <td className="px-4 py-2 text-right font-mono">
                    Q{budget.energy.toLocaleString('es-GT')}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono">
                    {((budget.energy / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-2">Otros gastos operativos</td>
                  <td className="px-4 py-2 text-right font-mono">
                    Q{budget.otherExpenses.toLocaleString('es-GT')}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono">
                    {((budget.otherExpenses / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="bg-slate-900 text-white font-bold">
                  <td className="px-4 py-2.5">Flujo Neto / Margen Operativo</td>
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

      {/* SECTION 3: IMPACTO DIRECTO DE PAROS POR MÁQUINA */}
      {machine && (
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 border border-amber-300 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Conexión Real: Mantenimiento vs Finanzas de {machine.code}</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            Las horas de paro no son solo una cifra técnica de taller: impactan directamente el flujo de efectivo y el cumplimiento del punto de equilibrio.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Producción Esperada</span>
              <span className="text-lg font-black text-slate-900 font-mono">{expectedUnits}</span>
              <span className="text-[10px] text-slate-400 block">unidades</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Producción Real</span>
              <span className="text-lg font-black text-blue-900 font-mono">{currentUnits}</span>
              <span className="text-[10px] text-slate-400 block">unidades</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Diferencia de Volumen</span>
              <span className="text-lg font-black text-rose-600 font-mono">
                {currentUnits - expectedUnits}
              </span>
              <span className="text-[10px] text-rose-500 font-semibold block">unid no producidas</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Horas de Paro</span>
              <span className="text-lg font-black text-amber-700 font-mono">{stoppedHours} h</span>
              <span className="text-[10px] text-slate-400 block">acumuladas</span>
            </div>

          </div>

          {/* Golden Highlight Box: Estimated Downtime Cost */}
          <div className="p-3.5 bg-white/90 rounded-2xl border-2 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                ⚠️ Impacto Estimado por Tiempo Improductivo:
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Calculado sobre margen de contribución perdido por {unitsLost} unidades no conformadas
              </span>
            </div>
            <div className="px-4 py-1.5 bg-rose-600 text-white rounded-xl font-mono font-black text-base shadow-sm shrink-0">
              Q{downtimeFinancialImpact.toLocaleString('es-GT')}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
