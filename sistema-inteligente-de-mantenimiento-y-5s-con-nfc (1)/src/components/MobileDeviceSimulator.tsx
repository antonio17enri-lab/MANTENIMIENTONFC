import React, { useState } from 'react';
import {
  FileText,
  Wrench,
  AlertTriangle,
  CheckSquare,
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Tag,
  Plus,
  Radio,
  ExternalLink,
  ShieldCheck,
  Zap,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Settings as CogIcon
} from 'lucide-react';
import { Machine, MachineDocument, ProductionLog } from '../types';
import { ProductionOperationView } from './ProductionOperationView';
import { FinancialModule } from './FinancialModule';

interface MobileDeviceSimulatorProps {
  machine: Machine;
  allMachines?: Machine[];
  onOpenMaintenanceModal: () => void;
  onOpenFiveSModal: () => void;
  onOpenFailureModal: () => void;
  onTriggerNfcTap: () => void;
  onUpdateMachineStatus: (status: Machine['status']) => void;
  onSaveProductionLog?: (log: ProductionLog) => void;
}

type MobileScreen =
  | 'home'
  | 'ficha'
  | 'mantenimiento'
  | 'checklist'
  | 'fallas'
  | 'documentos'
  | 'doc-viewer'
  | 'produccion'
  | 'finanzas';

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  machine,
  allMachines = [],
  onOpenMaintenanceModal,
  onOpenFiveSModal,
  onOpenFailureModal,
  onTriggerNfcTap,
  onUpdateMachineStatus,
  onSaveProductionLog,
}) => {
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('home');
  const [selectedDoc, setSelectedDoc] = useState<MachineDocument | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Calculate days relative to today or standard target
  const getDaysUntil = (dateStr: string) => {
    try {
      const target = new Date(dateStr);
      const today = new Date('2024-09-13'); // Reference relative to demo timeline or current date
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) return `En ${diffDays} días`;
      if (diffDays === 0) return 'Hoy';
      return `Vencido hace ${Math.abs(diffDays)} días`;
    } catch {
      return 'En 12 días';
    }
  };

  const statusBadge = () => {
    switch (machine.status) {
      case 'OPERATIVA':
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-600 text-white shadow-xs">
            OPERATIVA
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500 text-white shadow-xs">
            EN REVISIÓN
          </span>
        );
      case 'PARADA_FALLA':
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-rose-600 text-white shadow-xs">
            PARADA / FALLA
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Screen quick tab switcher for fast testing */}
      <div className="w-full max-w-[370px] mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Radio className="w-3 h-3 text-blue-600" />
          Terminal NFC ({machine.code})
        </span>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              currentScreen === 'home' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setCurrentScreen('ficha')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              currentScreen === 'ficha' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ficha
          </button>
          <button
            onClick={() => setCurrentScreen('mantenimiento')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              currentScreen === 'mantenimiento' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mtto
          </button>
          <button
            onClick={() => setCurrentScreen('checklist')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              currentScreen === 'checklist' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            5S
          </button>
          <button
            onClick={() => setCurrentScreen('fallas')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              currentScreen === 'fallas' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Fallas
          </button>
          <button
            onClick={() => setCurrentScreen('produccion')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              currentScreen === 'produccion' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Horas y Producción"
          >
            Prod
          </button>
          <button
            onClick={() => setCurrentScreen('finanzas')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              currentScreen === 'finanzas' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Punto de Equilibrio"
          >
            Finanzas
          </button>
        </div>
      </div>

      {/* Realistic Smartphone Frame matching the image */}
      <div className="relative w-full max-w-[360px] h-[690px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 mr-4"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>
        </div>

        {/* Screen Bezel inner container */}
        <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative text-slate-800 select-none">
          
          {/* Mobile Top Status Bar */}
          <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-700 z-20 shrink-0">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" title="NFC Activo"></span>
              <span className="text-[10px] font-mono text-blue-700 font-bold">NFC ON</span>
              <div className="w-4 h-2.5 border border-slate-700 rounded-xs relative">
                <div className="absolute inset-0.5 bg-slate-800 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* NFC Tap banner trigger */}
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-900">Tag: {machine.code}</span>
            </div>
            <button
              onClick={onTriggerNfcTap}
              className="text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              Simular Tap
            </button>
          </div>

          {/* SCREEN CONTENT AREA (Scrollable) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
            {/* 1. HOME SCREEN */}
            {currentScreen === 'home' && (
              <div className="p-4 flex flex-col flex-1 pb-6">
                {/* Header */}
                <div className="text-center mt-1 mb-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">MÁQUINA</div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {machine.code}
                  </div>
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {machine.category} - {machine.name}
                  </div>
                </div>

                {/* Machine Photo Card */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 shadow-xs mb-3.5 group">
                  <img
                    src={machine.imageUrl}
                    alt={machine.name}
                    className="w-full h-36 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[11px] font-medium text-white/90">
                      {machine.brand} • Mod. {machine.model}
                    </span>
                  </div>
                </div>

                {/* Machine Status */}
                <div className="text-center mb-4 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Estado general</span>
                  <div className="flex items-center justify-center gap-2">
                    {statusBadge()}
                  </div>

                  {/* Quick status change toggler */}
                  <div className="mt-2 flex items-center justify-center gap-1 pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => onUpdateMachineStatus('OPERATIVA')}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                        machine.status === 'OPERATIVA' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Operativa
                    </button>
                    <button
                      onClick={() => onUpdateMachineStatus('EN_REVISION')}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                        machine.status === 'EN_REVISION' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Revisión
                    </button>
                    <button
                      onClick={() => onUpdateMachineStatus('PARADA_FALLA')}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                        machine.status === 'PARADA_FALLA' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Falla
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons (matching the infographic buttons) */}
                <div className="space-y-2 flex-1">
                  <button
                    id="mobile-nav-ficha"
                    onClick={() => setCurrentScreen('ficha')}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">Ficha técnica</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </button>

                  <button
                    id="mobile-nav-mantenimiento"
                    onClick={() => setCurrentScreen('mantenimiento')}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600">Mantenimiento</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                        25/09
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                    </div>
                  </button>

                  <button
                    id="mobile-nav-fallas"
                    onClick={() => setCurrentScreen('fallas')}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600">Fallas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {machine.failures.length > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                          {machine.failures.length}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                    </div>
                  </button>

                  <button
                    id="mobile-nav-checklist"
                    onClick={() => setCurrentScreen('checklist')}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">5S - Checklist</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {machine.latest5S.generalCompliance}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                  </button>

                  <button
                    id="mobile-nav-manuales"
                    onClick={() => setCurrentScreen('documentos')}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Manual / Documentos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </button>

                  <button
                    id="mobile-nav-produccion"
                    onClick={() => setCurrentScreen('produccion')}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CogIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">⚙️ Horas & Producción</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        {machine.productionMetrics?.producedUnits ?? 540} unid
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </button>

                  <button
                    id="mobile-nav-finanzas"
                    onClick={() => setCurrentScreen('finanzas')}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 shadow-2xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">💰 Punto de Equilibrio</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Q{machine.financials?.monthlyFixedCost ?? 15000}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 2. FICHA TÉCNICA SCREEN */}
            {currentScreen === 'ficha' && (
              <div className="p-4 flex flex-col flex-1 pb-6">
                {/* Screen Header */}
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-slate-900">Ficha técnica</h2>
                </div>

                {/* Technical data table (matching the visual layout in phone mockup 2) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2.5 shadow-2xs mb-4 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Código:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {machine.code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Máquina:</span>
                    <span className="font-medium text-slate-800">{machine.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Marca:</span>
                    <span className="font-bold text-slate-900">{machine.brand}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Modelo:</span>
                    <span className="font-medium text-slate-800">{machine.model}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Año:</span>
                    <span className="font-medium text-slate-800">{machine.year}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Ubicación:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {machine.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500">Responsable:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {machine.responsible}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs mb-4 text-xs">
                  <span className="font-bold text-slate-700 block mb-1.5">Descripción:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {machine.description}
                  </p>
                </div>

                {/* Additional Specs */}
                <div className="bg-slate-100/80 rounded-xl p-3 mb-4 text-[11px] space-y-1.5">
                  <div className="font-bold text-slate-700 mb-1">Especificaciones Operativas:</div>
                  {machine.specs.power && (
                    <div className="flex justify-between text-slate-600">
                      <span>Potencia motriz:</span>
                      <span className="font-semibold text-slate-900">{machine.specs.power}</span>
                    </div>
                  )}
                  {machine.specs.rpm && (
                    <div className="flex justify-between text-slate-600">
                      <span>Velocidad de giro:</span>
                      <span className="font-semibold text-slate-900">{machine.specs.rpm}</span>
                    </div>
                  )}
                  {machine.specs.voltage && (
                    <div className="flex justify-between text-slate-600">
                      <span>Alimentación eléctrica:</span>
                      <span className="font-semibold text-slate-900">{machine.specs.voltage}</span>
                    </div>
                  )}
                </div>

                {/* Machine Photo Small (bottom of phone 2) */}
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs mb-3">
                  <img
                    src={machine.imageUrl}
                    alt={machine.name}
                    className="w-full h-24 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {/* 3. MANTENIMIENTO SCREEN (matching phone mockup 3) */}
            {currentScreen === 'mantenimiento' && (
              <div className="p-4 flex flex-col flex-1 pb-6">
                {/* Screen Header */}
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-slate-900">Mantenimiento</h2>
                </div>

                {/* Card: Próxima revisión */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                      Próxima revisión
                    </span>
                    <div className="text-lg font-black text-slate-900">
                      {machine.nextRevisionDate.split('-').reverse().join('/')}
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block mt-1">
                      {getDaysUntil(machine.nextRevisionDate)}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                {/* Card: Último mantenimiento */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs mb-4 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Último mantenimiento
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {machine.lastMaintenanceDate.split('-').reverse().join('/')}
                  </div>
                  <div className="text-slate-600 font-medium mt-0.5">
                    {machine.lastMaintenanceType}
                  </div>
                </div>

                {/* Historial de mantenimientos */}
                <div className="flex-1 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Historial de mantenimientos</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {machine.maintenanceHistory.length} registros
                    </span>
                  </div>

                  <div className="space-y-2">
                    {machine.maintenanceHistory.map((item) => {
                      const isExpanded = expandedHistoryId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                          className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:border-slate-300 transition-all cursor-pointer text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{item.date}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.type === 'Preventivo'
                                  ? 'bg-blue-50 text-blue-700'
                                  : item.type === 'Correctivo'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600 animate-fadeIn">
                              <p className="text-slate-700 font-medium">{item.description}</p>
                              <div className="flex items-center justify-between text-slate-500">
                                <span>Técnico: <strong className="text-slate-800">{item.technician}</strong></span>
                                {item.durationHours && <span>Duración: {item.durationHours}h</span>}
                              </div>
                              {item.partsReplaced && item.partsReplaced.length > 0 && (
                                <div className="text-[10px] text-slate-500">
                                  Repuestos: {item.partsReplaced.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Button: Registrar mantenimiento (matches image) */}
                <button
                  id="mobile-btn-registrar-mantenimiento"
                  onClick={onOpenMaintenanceModal}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar mantenimiento</span>
                </button>
              </div>
            )}

            {/* 4. 5S - CHECKLIST SCREEN (matching phone mockup 4) */}
            {currentScreen === 'checklist' && (
              <div className="p-4 flex flex-col flex-1 pb-6">
                {/* Screen Header */}
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-slate-900">5S - Checklist</h2>
                </div>

                {/* Central circular gauge (matching phone 4: 5S 85% Cumplimiento general) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs mb-4 flex flex-col items-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG circular progress */}
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 44}
                        strokeDashoffset={2 * Math.PI * 44 * (1 - machine.latest5S.generalCompliance / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-500">5S</span>
                      <span className="text-2xl font-black text-slate-900">
                        {machine.latest5S.generalCompliance}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 mt-1">
                    Cumplimiento general
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Última auditoría: {machine.latest5S.date}
                  </span>
                </div>

                {/* Progress bars list (matching phone 4) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs mb-4 space-y-2.5">
                  {machine.latest5S.categories.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{cat.category}</span>
                        <span className="text-emerald-600 font-bold">{cat.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${cat.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Button: Nueva inspección 5S (matches image) */}
                <button
                  id="mobile-btn-nueva-inspeccion-5s"
                  onClick={onOpenFiveSModal}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Nueva inspección 5S</span>
                </button>
              </div>
            )}

            {/* 5. FALLAS SCREEN */}
            {currentScreen === 'fallas' && (
              <div className="p-4 flex flex-col flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-slate-900">Registro de Fallas</h2>
                </div>

                <div className="flex-1 mb-4">
                  {machine.failures.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">Sin fallas activas</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">La máquina opera según parámetros nominales.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {machine.failures.map((f) => (
                        <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-900">{f.type}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                f.status === 'Solucionada'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : f.status === 'En Proceso'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {f.status}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mb-2">{f.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                            <span>Fecha: {f.date}</span>
                            <span>Reportó: {f.reportedBy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  id="mobile-btn-reportar-falla"
                  onClick={onOpenFailureModal}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reportar nueva falla</span>
                </button>
              </div>
            )}

            {/* 6. DOCUMENTOS SCREEN */}
            {currentScreen === 'documentos' && (
              <div className="p-4 flex flex-col flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-slate-900">Manual / Documentos</h2>
                </div>

                <div className="space-y-2 flex-1">
                  {machine.documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setCurrentScreen('doc-viewer');
                      }}
                      className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 leading-snug">{doc.title}</div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>{doc.filename}</span>
                            <span>•</span>
                            <span>{doc.dateAdded}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. DOC VIEWER */}
            {currentScreen === 'doc-viewer' && selectedDoc && (
              <div className="p-4 flex flex-col flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('documentos')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xs font-bold text-slate-900 truncate">{selectedDoc.title}</h2>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs mb-3 text-xs space-y-2">
                  <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                    Documento Oficial
                  </div>
                  <h3 className="font-bold text-slate-900">{selectedDoc.title}</h3>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{selectedDoc.description}</p>
                </div>

                <div className="flex-1 bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[10px] overflow-y-auto space-y-2">
                  <div className="text-emerald-400 font-bold">// VISOR DIGITAL DE PROTOCOLO INDUSTRIAL</div>
                  <div>ID_DOC: {selectedDoc.id}</div>
                  <div>ARCH_DIGITAL: {selectedDoc.filename}</div>
                  <div>MÁQUINA: {machine.code} ({machine.name})</div>
                  <div>FECHA_VER: {selectedDoc.dateAdded}</div>
                  <hr className="border-slate-800" />
                  <p className="text-slate-300">
                    1. Verifique siempre el aislamiento de fuentes de energía antes de intervenir.
                    <br />
                    2. Registre el evento en el tag NFC al finalizar la inspección.
                    <br />
                    3. Mantenga la guarda de seguridad en su posición durante el arranque.
                  </p>
                </div>
              </div>
            )}

            {/* 8. HORAS DE OPERACIÓN Y PRODUCCIÓN SCREEN */}
            {currentScreen === 'produccion' && (
              <div className="p-3.5 flex flex-col flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Horas y Producción</h2>
                    <span className="text-[10px] text-slate-500 font-mono">{machine.code} • {machine.name}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <ProductionOperationView
                    machine={machine}
                    onSaveProductionLog={(log: ProductionLog) => {
                      if (onSaveProductionLog) onSaveProductionLog(log);
                    }}
                  />
                </div>
              </div>
            )}

            {/* 9. PUNTO DE EQUILIBRIO Y FINANZAS SCREEN */}
            {currentScreen === 'finanzas' && (
              <div className="p-3.5 flex flex-col flex-1 pb-6">
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Punto de Equilibrio</h2>
                    <span className="text-[10px] text-slate-500 font-mono">{machine.code} • Costos & Margen</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <FinancialModule machine={machine} allMachines={allMachines} />
                </div>
              </div>
            )}
          </div>

          {/* Phone Bottom Home Bar */}
          <div className="py-2 flex items-center justify-center shrink-0 bg-slate-50">
            <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
