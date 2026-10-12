import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Clock,
  Wrench,
  CheckSquare,
  AlertTriangle,
  BookOpen,
  DollarSign,
  Radio,
  Share2,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  MapPin,
  Tag,
  Zap,
  Plus,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Machine, MachineDocument, MaintenanceRecord, FailureReport, FiveSAudit, ProductionLog } from '../types';
import { ProductionOperationView } from './ProductionOperationView';
import { FinancialModule } from './FinancialModule';
import { TagOpsLogo } from './TagOpsLogo';

interface OperatorMachineViewProps {
  machine: Machine;
  allMachines: Machine[];
  onBackToWelcome: () => void;
  onSelectMachine: (machine: Machine) => void;
  onOpenMaintenanceModal: () => void;
  onOpenFiveSModal: () => void;
  onOpenFailureModal: () => void;
  onOpenNfcConfig: () => void;
  onUpdateMachineStatus: (status: Machine['status']) => void;
  onSaveProductionLog: (log: ProductionLog) => void;
}

type OperatorTab =
  | 'overview'
  | 'produccion'
  | 'ficha'
  | 'mantenimiento'
  | '5s'
  | 'fallas'
  | 'documentos'
  | 'finanzas';

export const OperatorMachineView: React.FC<OperatorMachineViewProps> = ({
  machine,
  allMachines,
  onBackToWelcome,
  onSelectMachine,
  onOpenMaintenanceModal,
  onOpenFiveSModal,
  onOpenFailureModal,
  onOpenNfcConfig,
  onUpdateMachineStatus,
  onSaveProductionLog,
}) => {
  const [activeTab, setActiveTab] = useState<OperatorTab>('overview');
  const [selectedDoc, setSelectedDoc] = useState<MachineDocument | null>(null);

  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'OPERATIVA':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> OPERATIVA
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1.5 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> EN REVISIÓN
          </span>
        );
      case 'PARADA_FALLA':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1.5 shadow-xs">
            <XCircle className="w-3.5 h-3.5" /> PARADA / FALLA
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Fixed Operator Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 px-4 py-2.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToWelcome}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Volver a la terminal principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Escanear / Salir</span>
            </button>

            <div className="h-6 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-cyan-300 text-base sm:text-lg">
                {machine.code}
              </span>
              <span className="text-slate-400 hidden md:inline">•</span>
              <span className="text-sm font-bold text-slate-200 truncate max-w-[160px] sm:max-w-none">
                {machine.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick machine selector switch */}
            <select
              value={machine.id}
              onChange={(e) => {
                const found = allMachines.find((m) => m.id === e.target.value);
                if (found) onSelectMachine(found);
              }}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allMachines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>

            <button
              onClick={onOpenNfcConfig}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Configurar Tag NFC de esta máquina"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden md:inline">Tag NFC</span>
            </button>
          </div>

        </div>
      </header>

      {/* Machine Context Banner */}
      <div className="bg-slate-950 text-white border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
              <img
                src={machine.imageUrl}
                alt={machine.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {machine.brand} {machine.model} ({machine.year})
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-300">{machine.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {getStatusBadge(machine.status)}
                <span className="text-xs text-slate-400">
                  Resp: <strong className="text-slate-200">{machine.responsible}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick status toggles */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Cambiar:</span>
            <button
              onClick={() => onUpdateMachineStatus('OPERATIVA')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                machine.status === 'OPERATIVA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Operativa
            </button>
            <button
              onClick={() => onUpdateMachineStatus('EN_REVISION')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                machine.status === 'EN_REVISION'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Revisión
            </button>
            <button
              onClick={() => onUpdateMachineStatus('PARADA_FALLA')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                machine.status === 'PARADA_FALLA'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Parada
            </button>
          </div>

        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[53px] z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Resumen</span>
          </button>

          <button
            onClick={() => setActiveTab('produccion')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'produccion'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>⚙️ Horas & Producción</span>
          </button>

          <button
            onClick={() => setActiveTab('ficha')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ficha'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ficha Técnica</span>
          </button>

          <button
            onClick={() => setActiveTab('mantenimiento')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'mantenimiento'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Mantenimiento</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {machine.maintenanceHistory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('5s')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === '5s'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Auditoría 5S</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {machine.latest5S.generalCompliance}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fallas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'fallas'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fallas & Averías</span>
            {machine.failures.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
                {machine.failures.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'documentos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manuales & Planos</span>
          </button>

          <button
            onClick={() => setActiveTab('finanzas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'finanzas'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>💰 Punto de Eq & Flujo</span>
          </button>

        </div>
      </div>

      {/* Main Tab Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* Card 1: Próxima Revisión */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Próxima Revisión</span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-mono font-black text-slate-900 mt-1">
                  {machine.nextRevisionDate}
                </div>
                <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">
                  Mantenimiento preventivo programado
                </span>
              </div>

              {/* Card 2: Último Mantenimiento */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Último Servicio</span>
                  <Wrench className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-mono font-black text-slate-900 mt-1">
                  {machine.lastMaintenanceDate}
                </div>
                <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                  Tipo: {machine.lastMaintenanceType || 'Preventivo'}
                </span>
              </div>

              {/* Card 3: Cumplimiento 5S */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Auditoría 5S</span>
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-mono font-black text-emerald-700 mt-1">
                  {machine.latest5S.generalCompliance}%
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${machine.latest5S.generalCompliance}%` }}
                  />
                </div>
              </div>

              {/* Card 4: Producción y Utilización */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Horas & Producción</span>
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-mono font-black text-slate-900 mt-1">
                  {machine.productionMetrics?.producedUnits || 540} <span className="text-xs font-normal text-slate-500">unid</span>
                </div>
                <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
                  {machine.productionMetrics?.workedHours || 135}h trab. • {machine.productionMetrics?.stoppedHours || 25}h paro
                </span>
              </div>

            </div>

            {/* Direct Action Hub */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                Acciones Técnicas Disponibles para el Operador
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={onOpenMaintenanceModal}
                  className="p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-amber-950 mt-2">Registrar Mantenimiento</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Añade servicio preventivo o correctivo con firma digital y foto
                  </p>
                </button>

                <button
                  onClick={onOpenFiveSModal}
                  className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-600 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-emerald-950 mt-2">Ejecutar Checklist 5S</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Evalúa Seiri, Seiton, Seiso, Seiketsu, Shitsuke y Seguridad
                  </p>
                </button>

                <button
                  onClick={onOpenFailureModal}
                  className="p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-600 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-rose-950 mt-2">Reportar Avería o Falla</h4>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Notifica paro de máquina y añade foto de la avería
                  </p>
                </button>
              </div>
            </div>

            {/* Quick Summary of Production & Financial Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Quick Hours Preview */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Horas y Rendimiento</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('produccion')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Ver detalle completo →
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold block">Disponibles</span>
                    <span className="text-lg font-black text-slate-900 font-mono">160h</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <span className="text-[10px] text-emerald-700 font-bold block">Trabajadas</span>
                    <span className="text-lg font-black text-emerald-800 font-mono">
                      {machine.productionMetrics?.workedHours || 135}h
                    </span>
                  </div>
                  <div className="p-2.5 bg-rose-50 rounded-xl">
                    <span className="text-[10px] text-rose-700 font-bold block">Detenidas</span>
                    <span className="text-lg font-black text-rose-700 font-mono">
                      {machine.productionMetrics?.stoppedHours || 25}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Financial Preview */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Punto de Equilibrio & Costos</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('finanzas')}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Ver módulo financiero →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold block">Punto de Equilibrio</span>
                    <span className="text-lg font-black text-slate-900 font-mono">600 unid</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-xl">
                    <span className="text-[10px] text-amber-800 font-bold block">Impacto de Paros</span>
                    <span className="text-lg font-black text-rose-700 font-mono">Q1,500</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. PRODUCCION Y HORAS TAB */}
        {activeTab === 'produccion' && (
          <ProductionOperationView
            machine={machine}
            onSaveProductionLog={onSaveProductionLog}
          />
        )}

        {/* 3. FICHA TECNICA TAB */}
        {activeTab === 'ficha' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Ficha Técnica Digital • {machine.code}
                </h3>
                <p className="text-xs text-slate-500">{machine.description}</p>
              </div>
              <button
                onClick={onOpenNfcConfig}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Ver Tag NFC</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Marca & Fabricante</span>
                <div className="font-bold text-slate-900 text-sm">{machine.brand}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Modelo</span>
                <div className="font-bold text-slate-900 text-sm">{machine.model}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Año de Instalación</span>
                <div className="font-bold text-slate-900 text-sm font-mono">{machine.year}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ubicación en Planta</span>
                <div className="font-bold text-slate-900 text-sm">{machine.location}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Estación de Trabajo</span>
                <div className="font-bold text-slate-900 text-sm">{machine.stationId}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Operario a Cargo</span>
                <div className="font-bold text-slate-900 text-sm">{machine.responsible}</div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Especificaciones Mecánicas y Eléctricas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">Potencia</span>
                  <span className="text-sm font-bold text-blue-900 font-mono">{machine.specs.power}</span>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">Velocidad / RPM</span>
                  <span className="text-sm font-bold text-blue-900 font-mono">{machine.specs.rpm}</span>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">Alimentación</span>
                  <span className="text-sm font-bold text-blue-900 font-mono">{machine.specs.voltage}</span>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block">Peso</span>
                  <span className="text-sm font-bold text-blue-900 font-mono">{machine.specs.weight || 'N/D'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. MANTENIMIENTO TAB */}
        {activeTab === 'mantenimiento' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Bitácora de Mantenimiento</h3>
                <p className="text-xs text-slate-500">Historial de intervenciones preventivas y correctivas</p>
              </div>
              <button
                onClick={onOpenMaintenanceModal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Mantenimiento</span>
              </button>
            </div>

            <div className="space-y-3">
              {machine.maintenanceHistory.map((rec) => (
                <div key={rec.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {rec.type}
                      </span>
                      <span className="font-mono font-bold text-slate-700">{rec.date}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      Costo: Q{(rec.cost || 0).toLocaleString('es-GT')}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{rec.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Técnico: <strong className="text-slate-700">{rec.technician}</strong></span>
                    <span>Duración: <strong className="text-slate-700">{rec.durationHours} horas</strong></span>
                    {rec.partsReplaced && rec.partsReplaced.length > 0 && (
                      <span className="text-slate-600">
                        Repuestos: {rec.partsReplaced.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. AUDITORIA 5S TAB */}
        {activeTab === '5s' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Evaluación 5S y Estándares de Planta
                </h3>
                <p className="text-xs text-slate-500">
                  Auditoría vigente realizada el {machine.latest5S.date} por {machine.latest5S.auditor}
                </p>
              </div>
              <button
                onClick={onOpenFiveSModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Nueva Auditoría 5S</span>
              </button>
            </div>

            {/* General Score */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Nivel de Cumplimiento General
                </span>
                <div className="text-3xl font-black text-emerald-950 font-mono mt-0.5">
                  {machine.latest5S.generalCompliance}%
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  {machine.latest5S.observations || 'Zona de trabajo ordenada y señalizada conforme a norma.'}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                5S
              </div>
            </div>

            {/* 5S Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {machine.latest5S.categories.map((cat) => (
                <div key={cat.category} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{cat.category}</span>
                      <span className="text-[10px] text-slate-400 font-serif italic">{cat.japaneseName}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      {cat.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FALLAS TAB */}
        {activeTab === 'fallas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Averías y Reporte de Fallas</h3>
                <p className="text-xs text-slate-500">Historial de alertas mecánicas, eléctricas y operativas</p>
              </div>
              <button
                onClick={onOpenFailureModal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Reportar Avería</span>
              </button>
            </div>

            {machine.failures.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No hay fallas reportadas para esta máquina. El equipo opera con normalidad.
              </div>
            ) : (
              <div className="space-y-3">
                {machine.failures.map((f) => (
                  <div key={f.id} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          {f.type} ({f.severity})
                        </span>
                        <span className="font-mono text-slate-600">{f.date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.status === 'Solucionada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-600 text-white'
                      }`}>
                        {f.status}
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium">{f.description}</p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Reportado por: <strong className="text-slate-700">{f.reportedBy}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. MANUALES & DOCUMENTOS TAB */}
        {activeTab === 'documentos' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Manuales Técnicos, Planos y Documentación
              </h3>
              <p className="text-xs text-slate-500">
                Acceso instantáneo para el operario sin necesidad de carpetas físicas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {machine.documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <span className="font-bold text-xs text-slate-900">{doc.title}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{doc.description}</p>
                  <span className="text-[10px] text-slate-400 block font-mono">{doc.filename}</span>
                </div>
              ))}
            </div>

            {selectedDoc && (
              <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-cyan-300">
                    Visor de Documento: {selectedDoc.title}
                  </span>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cerrar visor ✕
                  </button>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl text-xs space-y-2 text-slate-300 leading-relaxed font-mono">
                  <p><strong>Archivo:</strong> {selectedDoc.filename}</p>
                  <p><strong>Descripción:</strong> {selectedDoc.description}</p>
                  <p className="text-emerald-400">
                    ✓ Documento técnico precargado para consulta directa del operario en planta.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. FINANZAS TAB */}
        {activeTab === 'finanzas' && (
          <FinancialModule machine={machine} allMachines={allMachines} />
        )}

      </main>

    </div>
  );
};
