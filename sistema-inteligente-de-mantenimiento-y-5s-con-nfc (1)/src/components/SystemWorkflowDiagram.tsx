import React from 'react';
import {
  Smartphone,
  Radio,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface SystemWorkflowDiagramProps {
  onTriggerScan: () => void;
  onOpenChecklist: () => void;
}

export const SystemWorkflowDiagram: React.FC<SystemWorkflowDiagramProps> = ({
  onTriggerScan,
  onOpenChecklist,
}) => {
  return (
    <div className="space-y-6">
      {/* Box: CÓMO FUNCIONA EL SISTEMA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              CÓMO FUNCIONA EL SISTEMA
            </h2>
            <p className="text-xs text-slate-500">
              Ciclo continuo de captura en piso de planta y analítica digital
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full self-start sm:self-auto border border-blue-100">
            Arquitectura 100% Digital
          </span>
        </div>

        {/* 6-step flow diagram */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
          
          {/* Step 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-2xs hover:border-blue-300 transition-colors">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
              Paso 1
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-2 shadow-xs">
              <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              1. Etiqueta NFC en la máquina
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Tag industrial pasivo instalado en chasis con código único (e.g. M-001).
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={onTriggerScan}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-2xs hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
              Paso 2
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1 group-hover:text-blue-700">
              2. Usuario acerca el celular
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Lectura instantánea sin necesidad de instalar apps pesadas.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-2xs hover:border-blue-300 transition-colors">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
              Paso 3
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              3. Acceso a ficha digital
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Apertura directa de historial, estado operativo y manuales técnicos.
            </p>
          </div>

          {/* Step 4 */}
          <div
            onClick={onOpenChecklist}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-2">
              Paso 4
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1 group-hover:text-emerald-800">
              4. Registros y checklists
            </h4>
            <div className="text-[10px] text-slate-600 space-y-0.5 mt-1 font-medium">
              <span className="inline-block bg-blue-100 text-blue-800 px-1 rounded mr-1">Mtto</span>
              <span className="inline-block bg-rose-100 text-rose-800 px-1 rounded mr-1">Fallas</span>
              <span className="inline-block bg-emerald-100 text-emerald-800 px-1 rounded">5S</span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-2xs hover:border-blue-300 transition-colors">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
              Paso 5
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-2 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              5. Almacenamiento de datos
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Sincronización en la nube (Google Sheets / BD central) en tiempo real.
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-2xs hover:border-blue-300 transition-colors">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
              Paso 6
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              6. Indicadores y mejora
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              KPIs automatizados, Looker Studio y acciones correctivas Kaizen.
            </p>
          </div>

        </div>

        {/* HERRAMIENTAS UTILIZADAS (Box bottom left from image) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                N))
              </div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                HERRAMIENTAS UTILIZADAS:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Google Sites / Web App</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>Google Forms</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Google Sheets</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span>Looker Studio (Reportes)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Box: BENEFICIOS DEL SISTEMA (Bottom banner in the image) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          BENEFICIOS DEL SISTEMA
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              Acceso inmediato a la información
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              Trazabilidad de mantenimientos y fallas
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              Control del cumplimiento de 5S y seguridad
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              Mejora en la toma de decisiones
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              Menos papel, más eficiencia operativa
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
