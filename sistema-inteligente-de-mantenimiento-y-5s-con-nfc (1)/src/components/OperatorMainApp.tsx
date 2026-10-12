import React, { useState } from 'react';
import {
  FileText,
  Wrench,
  AlertTriangle,
  CheckSquare,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Plus,
  Radio,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  LogOut,
  SlidersHorizontal,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Camera,
  Home,
  RefreshCw,
} from 'lucide-react';
import { Machine, MaintenanceRecord, FailureReport, FiveSAudit, MachineDocument, ProductionLog, AppUser } from '../types';
import { TagOpsLogo } from './TagOpsLogo';
import { ProductionOperationView } from './ProductionOperationView';
import { FinancialModule } from './FinancialModule';
import { QuickProductionModal } from './QuickProductionModal';

interface OperatorMainAppProps {
  machine: Machine;
  allMachines: Machine[];
  currentUser: AppUser;
  onSelectMachine: (m: Machine) => void;
  onUpdateMachineStatus: (status: 'OPERATIVA' | 'EN_REVISION' | 'PARADA_FALLA') => void;
  onOpenMaintenanceModal: () => void;
  onOpenFailureModal: () => void;
  onOpenFiveSModal: () => void;
  onOpenNfcConfig: () => void;
  onOpenNfcWriter?: (machineCode?: string) => void;
  onOpenChangePhoto?: (machine: Machine) => void;
  onSaveProductionLog: (log: ProductionLog) => void;
  onLogout: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenUserManual?: () => void;
  serverStatus?: 'online' | 'offline' | 'syncing';
  lastSyncTime?: string;
  onTriggerSync?: () => void;
}

export type ScreenType =
  | 'home'
  | 'ficha'
  | 'mantenimiento'
  | 'checklist'
  | 'fallas'
  | 'documentos'
  | 'doc-viewer'
  | 'produccion'
  | 'finanzas';

export const OperatorMainApp: React.FC<OperatorMainAppProps> = ({
  machine,
  allMachines,
  currentUser,
  onSelectMachine,
  onUpdateMachineStatus,
  onOpenMaintenanceModal,
  onOpenFailureModal,
  onOpenFiveSModal,
  onOpenNfcConfig,
  onOpenNfcWriter,
  onOpenChangePhoto,
  onSaveProductionLog,
  onLogout,
  onOpenAdminDashboard,
  onOpenUserManual,
  serverStatus,
  lastSyncTime,
  onTriggerSync,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedDoc, setSelectedDoc] = useState<MachineDocument | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [showQuickProdModal, setShowQuickProdModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProductionWithFeedback = (log: ProductionLog) => {
    onSaveProductionLog(log);
    showToast(`✅ Producción registrada: +${log.unitsProduced} unidades (${log.hoursWorked}h trabajadas)`);
  };

  // Status visual indicator
  const renderStatusBadge = () => {
    switch (machine.status) {
      case 'OPERATIVA':
        return (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-emerald-500 text-white shadow-xs">
            ● OPERATIVA
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-amber-500 text-white shadow-xs">
            ● EN REVISIÓN
          </span>
        );
      case 'PARADA_FALLA':
        return (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-rose-600 text-white shadow-xs animate-pulse">
            ● PARADA / FALLA
          </span>
        );
    }
  };

  // Days until next maintenance
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Vencido hace ${Math.abs(diff)} días`;
    if (diff === 0) return 'Hoy';
    return `En ${diff} días`;
  };

  // Production and Break-even stats for the main card
  const producedUnits = machine.productionMetrics?.producedUnits ?? 540;
  const expectedUnits = machine.productionMetrics?.expectedUnits ?? 600;
  const workedHours = machine.productionMetrics?.workedHours ?? 135;
  const availableHours = machine.productionMetrics?.availableHours ?? 160;
  const prodPercent = Math.min(100, Math.round((producedUnits / (expectedUnits || 1)) * 100));

  const breakEvenUnits =
    machine.financials && machine.financials.salePricePerUnit > machine.financials.variableCostPerUnit
      ? Math.round(
          machine.financials.monthlyFixedCost /
            (machine.financials.salePricePerUnit - machine.financials.variableCostPerUnit)
        )
      : 400;

  const isOverBreakEven = producedUnits >= breakEvenUnits;
  const diffFromBreakEven = producedUnits - breakEvenUnits;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container: Native App layout for Mobile & Tablet (No fake phone bezel) */}
      <div className="w-full max-w-xl min-h-screen bg-white shadow-xl sm:border-x sm:border-slate-200 flex flex-col">
        
        {/* Top Native App Bar - Clean, spacious, no overlap */}
        <header className="bg-slate-900 text-white px-3 py-2.5 sticky top-0 z-30 shadow-md flex items-center justify-between border-b border-slate-800 w-full min-w-0">
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <TagOpsLogo size="sm" showSubtitle={false} variant="dark" />
          </div>

          {/* Machine selector dropdown - dedicated middle area, no overlap */}
          <div className="flex-1 mx-2 min-w-0 max-w-[210px]">
            <select
              value={machine.id}
              onChange={(e) => {
                const found = allMachines.find((m) => m.id === e.target.value);
                if (found) {
                  onSelectMachine(found);
                  setCurrentScreen('home');
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 text-white text-[11px] sm:text-xs font-bold px-2 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer truncate shadow-xs"
              title="Seleccionar máquina"
            >
              {allMachines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* User Manual Button */}
            {onOpenUserManual && (
              <button
                type="button"
                onClick={onOpenUserManual}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Manual de Usuario y Operación (PDF)"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            )}



            {/* Real-time multi-device sync button */}
            {onTriggerSync && (
              <button
                type="button"
                onClick={onTriggerSync}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center ${
                  serverStatus === 'online'
                    ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
                    : serverStatus === 'syncing'
                    ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 animate-pulse'
                    : 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                }`}
                title={`Sincronización central: ${serverStatus === 'online' ? 'En línea' : 'Reconectando'}. Última: ${lastSyncTime || 'N/A'}. Clic para forzar actualización.`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${serverStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNfcConfig}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Escanear / Simular Tag NFC"
            >
              <Radio className="w-3.5 h-3.5" />
            </button>

            {/* Logout / Exit button - ALWAYS CLEARLY VISIBLE */}
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
              title="Cerrar sesión / Salir"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Salir</span>
            </button>
          </div>

        </header>

        {/* Dynamic Content Views */}
        <main className="flex-1 flex flex-col">
          
          {/* ==================================================== */}
          {/* 1. HOME SCREEN: EXACTLY MATCHING USER PROTOTYPE      */}
          {/* ==================================================== */}
          {currentScreen === 'home' && (
            <div className="p-4 sm:p-5 flex flex-col flex-1 pb-8 space-y-4">
              
              {/* Header: Machine code and category */}
              <div className="text-center pt-1">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  MÁQUINA
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {machine.code}
                </div>
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5">
                  {machine.category} - {machine.name}
                </div>
              </div>

              {/* Machine Photo Card with details badge */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group">
                <img
                  src={machine.imageUrl}
                  alt={machine.name}
                  className="w-full h-44 object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Change photo button */}
                {onOpenChangePhoto && (
                  <button
                    type="button"
                    onClick={() => onOpenChangePhoto(machine)}
                    className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/85 text-white border border-white/20 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-xs transition-transform active:scale-95 cursor-pointer z-10"
                    title={`Cambiar foto de ${machine.code}`}
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Cambiar Foto</span>
                  </button>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-3.5">
                  <div className="text-white">
                    <span className="text-xs font-bold block text-white/95">
                      {machine.brand} • Mod. {machine.model} ({machine.year})
                    </span>
                    <span className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {machine.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* NFC Physical Programming Quick Bar */}
              {onOpenNfcWriter && (
                <button
                  type="button"
                  onClick={() => onOpenNfcWriter(machine.code)}
                  className="w-full py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-900 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600 animate-pulse group-hover:scale-110 transition-transform" />
                    <span>🏷️ Grabar Tag NFC físico para {machine.code}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-blue-200 font-mono">
                    Programar chip
                  </span>
                </button>
              )}

              {/* User Manual Bar */}
              {onOpenUserManual && (
                <button
                  type="button"
                  onClick={onOpenUserManual}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>📖 Manual de Uso y Operación (PDF)</span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 font-bold">
                    Ver Guía
                  </span>
                </button>
              )}

              {/* General Status Card (matching prototype) */}
              <div className="text-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Estado general
                </span>
                
                <div className="flex items-center justify-center gap-2 mb-2.5">
                  {renderStatusBadge()}
                </div>

                {/* Quick status change toggler buttons */}
                <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => onUpdateMachineStatus('OPERATIVA')}
                    className={`text-xs px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                      machine.status === 'OPERATIVA'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Operativa
                  </button>
                  <button
                    onClick={() => onUpdateMachineStatus('EN_REVISION')}
                    className={`text-xs px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                      machine.status === 'EN_REVISION'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Revisión
                  </button>
                  <button
                    onClick={() => onUpdateMachineStatus('PARADA_FALLA')}
                    className={`text-xs px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                      machine.status === 'PARADA_FALLA'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Falla
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* ⚡ PROMINENT PRODUCTION ENTRY CARD (THE KEY USER REQUEST) */}
              {/* ========================================================= */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-blue-800 relative overflow-hidden">
                
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/80 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">
                        Control de Producción
                      </span>
                      <h3 className="text-sm font-black text-white">
                        Producción Acumulada
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-700/60 text-cyan-300">
                    {prodPercent}% Meta
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-3.5 text-xs">
                  <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
                    <span className="text-[10px] text-slate-300 block font-medium">Fabricado</span>
                    <div className="text-xl font-black font-mono text-white mt-0.5">
                      {producedUnits} <span className="text-xs font-normal text-slate-300">/ {expectedUnits}</span>
                    </div>
                    <span className="text-[10px] text-blue-200">unidades en mes</span>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
                    <span className="text-[10px] text-slate-300 block font-medium">Punto Equilibrio</span>
                    <div className="text-xl font-black font-mono text-cyan-300 mt-0.5">
                      {breakEvenUnits} <span className="text-xs font-normal text-slate-300">unid</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold">
                      {isOverBreakEven ? `🟢 +${diffFromBreakEven} (Ganancia)` : `🔴 Falta ${Math.abs(diffFromBreakEven)}`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 mb-3.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${prodPercent}%` }}
                  />
                </div>

                {/* Direct High-Impact Button: "INGRESAR PRODUCCIÓN" */}
                <button
                  id="btn-ingresar-produccion-home"
                  onClick={() => setShowQuickProdModal(true)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Ingresar Producción del Turno</span>
                </button>

              </div>

              {/* ======================================================== */}
              {/* PRIMARY ACTION BUTTONS (EXACT DESIGN MATCH TO PROTOTYPE) */}
              {/* ======================================================== */}
              <div className="space-y-2.5">
                
                {/* 1. Ficha Técnica */}
                <button
                  id="nav-ficha"
                  onClick={() => setCurrentScreen('ficha')}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600">
                      Ficha técnica
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                {/* 2. Mantenimiento */}
                <button
                  id="nav-mantenimiento"
                  onClick={() => setCurrentScreen('mantenimiento')}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-amber-600">
                      Mantenimiento
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-lg">
                      {machine.nextRevisionDate.split('-').slice(1).reverse().join('/')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </button>

                {/* 3. Fallas */}
                <button
                  id="nav-fallas"
                  onClick={() => setCurrentScreen('fallas')}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-rose-600">
                      Fallas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {machine.failures.length > 0 && (
                      <span className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-lg">
                        {machine.failures.length}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                  </div>
                </button>

                {/* 4. 5S - Checklist */}
                <button
                  id="nav-checklist"
                  onClick={() => setCurrentScreen('checklist')}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-600">
                      5S - Checklist
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg">
                      {machine.latest5S.generalCompliance}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </button>

                {/* 5. Manual / Documentos */}
                <button
                  id="nav-manuales"
                  onClick={() => setCurrentScreen('documentos')}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600">
                      Manual / Documentos
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                {/* 6. Horas & Producción Detallada */}
                <button
                  id="nav-produccion"
                  onClick={() => setCurrentScreen('produccion')}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600">
                      ⚙️ Horas & Producción Detallada
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-lg">
                      {producedUnits} unid
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>

                {/* 7. Presupuesto & Finanzas */}
                <button
                  id="nav-finanzas"
                  onClick={() => setCurrentScreen('finanzas')}
                  className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 text-slate-800 shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-600">
                      💰 Presupuesto & Finanzas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg">
                      Ppto: Q{machine.financials?.maintenanceBudget ?? 3500}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </button>

              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* 2. FICHA TÉCNICA SCREEN                              */}
          {/* ==================================================== */}
          {currentScreen === 'ficha' && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Ficha Técnica</h2>
                  <span className="text-xs text-slate-500">{machine.code} • {machine.name}</span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs mb-4 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Código interno:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    {machine.code}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Nombre del equipo:</span>
                  <span className="font-bold text-slate-800">{machine.name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Marca:</span>
                  <span className="font-bold text-slate-900">{machine.brand}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Modelo:</span>
                  <span className="font-medium text-slate-800">{machine.model}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Año de fabricación:</span>
                  <span className="font-medium text-slate-800">{machine.year}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Ubicación en planta:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {machine.location}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="font-semibold text-slate-500">Responsable asignado:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {machine.responsible}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-4 text-xs">
                <span className="font-bold text-slate-700 block mb-1.5">Descripción operativa:</span>
                <p className="text-slate-600 leading-relaxed">
                  {machine.description}
                </p>
              </div>

              {/* Technical Operating Parameters */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 text-xs space-y-2 border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">Parámetros Operativos:</div>
                {machine.specs.power && (
                  <div className="flex justify-between text-slate-600 py-0.5 border-b border-slate-200/60">
                    <span>Potencia motriz:</span>
                    <span className="font-semibold text-slate-900">{machine.specs.power}</span>
                  </div>
                )}
                {machine.specs.rpm && (
                  <div className="flex justify-between text-slate-600 py-0.5 border-b border-slate-200/60">
                    <span>Velocidad de husillo:</span>
                    <span className="font-semibold text-slate-900">{machine.specs.rpm}</span>
                  </div>
                )}
                {machine.specs.voltage && (
                  <div className="flex justify-between text-slate-600 py-0.5">
                    <span>Alimentación eléctrica:</span>
                    <span className="font-semibold text-slate-900">{machine.specs.voltage}</span>
                  </div>
                )}
              </div>

              {/* Machine Photo */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs mb-4">
                <img
                  src={machine.imageUrl}
                  alt={machine.name}
                  className="w-full h-40 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* 3. MANTENIMIENTO SCREEN                              */}
          {/* ==================================================== */}
          {currentScreen === 'mantenimiento' && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mantenimiento</h2>
                  <span className="text-xs text-slate-500">{machine.code} • Revisiones e Historial</span>
                </div>
              </div>

              {/* Próxima revisión */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                    Próxima revisión programada
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    {machine.nextRevisionDate.split('-').reverse().join('/')}
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md inline-block mt-1">
                    {getDaysUntil(machine.nextRevisionDate)}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              {/* Último mantenimiento */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs mb-4 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Último mantenimiento realizado
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {machine.lastMaintenanceDate.split('-').reverse().join('/')}
                </div>
                <div className="text-slate-600 font-medium mt-0.5">
                  Tipo: <strong className="text-slate-800">{machine.lastMaintenanceType}</strong>
                </div>
              </div>

              {/* Historial de mantenimientos */}
              <div className="flex-1 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Historial de intervenciones</span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {machine.maintenanceHistory.length} registros
                  </span>
                </div>

                <div className="space-y-2.5">
                  {machine.maintenanceHistory.map((item) => {
                    const isExpanded = expandedHistoryId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                        className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs hover:border-slate-300 transition-all cursor-pointer text-xs"
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
                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
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

              {/* Primary button: Registrar mantenimiento */}
              <button
                id="btn-registrar-mantenimiento"
                onClick={onOpenMaintenanceModal}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Mantenimiento</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* 4. 5S - CHECKLIST SCREEN                             */}
          {/* ==================================================== */}
          {currentScreen === 'checklist' && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">5S - Checklist</h2>
                  <span className="text-xs text-slate-500">{machine.code} • Auditoría de Orden y Limpieza</span>
                </div>
              </div>

              {/* Central circular gauge */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs mb-4 flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 * (1 - machine.latest5S.generalCompliance / 100)}
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
                <span className="text-xs font-bold text-slate-700 mt-2">
                  Cumplimiento general
                </span>
                <span className="text-[11px] text-slate-400">
                  Última auditoría realizada: {machine.latest5S.date}
                </span>
              </div>

              {/* 5S Categories breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-4 space-y-3">
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
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Observations */}
              {machine.latest5S.observations && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Observaciones de la auditoría:</span>
                  <p className="text-slate-600">{machine.latest5S.observations}</p>
                </div>
              )}

              {/* Primary button: Nueva inspección 5S */}
              <button
                id="btn-nueva-inspeccion-5s"
                onClick={onOpenFiveSModal}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Nueva Inspección 5S</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* 5. FALLAS SCREEN                                     */}
          {/* ==================================================== */}
          {currentScreen === 'fallas' && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Registro de Fallas</h2>
                  <span className="text-xs text-slate-500">{machine.code} • Averías e Incidencias</span>
                </div>
              </div>

              <div className="flex-1 mb-4">
                {machine.failures.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 my-4">
                    <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">Sin fallas activas</p>
                    <p className="text-xs text-slate-400 mt-1">La máquina se encuentra operando dentro de los parámetros esperados.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {machine.failures.map((f) => (
                      <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">{f.type}</span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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
                        <p className="text-slate-600 text-xs mb-2.5">{f.description}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>Fecha: {f.date}</span>
                          <span>Reportó: <strong className="text-slate-700">{f.reportedBy}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                id="btn-reportar-falla"
                onClick={onOpenFailureModal}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Reportar Nueva Falla</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* 6. DOCUMENTOS & MANUALES SCREEN                      */}
          {/* ==================================================== */}
          {currentScreen === 'documentos' && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manual / Documentos</h2>
                  <span className="text-xs text-slate-500">{machine.code} • Planos, Guías y Protocolos</span>
                </div>
              </div>

              <div className="space-y-2.5 flex-1">
                {machine.documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setCurrentScreen('doc-viewer');
                    }}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
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

          {/* ==================================================== */}
          {/* 7. DOC VIEWER SUB-SCREEN                             */}
          {/* ==================================================== */}
          {currentScreen === 'doc-viewer' && selectedDoc && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('documentos')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="truncate">
                  <h2 className="text-sm font-bold text-slate-900 truncate">{selectedDoc.title}</h2>
                  <span className="text-xs text-slate-500 font-mono">{selectedDoc.filename}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-3 text-xs space-y-2">
                <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                  Documento Oficial de Planta
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedDoc.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{selectedDoc.description}</p>
              </div>

              <div className="flex-1 bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-xs overflow-y-auto space-y-3">
                <div className="text-emerald-400 font-bold">// VISOR DIGITAL DE PROTOCOLO INDUSTRIAL TAG-OPS</div>
                <div>ID_DOCUMENTO: {selectedDoc.id}</div>
                <div>ARCHIVO: {selectedDoc.filename}</div>
                <div>MÁQUINA: {machine.code} ({machine.name})</div>
                <div>FECHA_VIGENCIA: {selectedDoc.dateAdded}</div>
                <hr className="border-slate-800" />
                <div className="space-y-2 text-slate-300">
                  <p className="font-sans text-xs">
                    <strong>1. Protocolo de Seguridad (LOTO):</strong> Verifique siempre el aislamiento total de fuentes de energía neumática y eléctrica antes de cualquier intervención mecánica o ajuste.
                  </p>
                  <p className="font-sans text-xs">
                    <strong>2. Verificación de EPP:</strong> Uso obligatorio de gafas de seguridad con protección lateral, calzado con puntera de acero y protección auditiva adecuada.
                  </p>
                  <p className="font-sans text-xs">
                    <strong>3. Registro por Tag NFC:</strong> Al finalizar la revisión o el cambio de turno, acerque el dispositivo al Tag NFC ubicado en el panel de control de la máquina para estampar la firma digital.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 8. HORAS DE OPERACIÓN Y PRODUCCIÓN DETALLADA         */}
          {/* ==================================================== */}
          {currentScreen === 'produccion' && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Horas & Rendimiento</h2>
                    <span className="text-xs text-slate-500">{machine.code} • Turnos y Métricas</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowQuickProdModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Ingresar</span>
                </button>
              </div>

              <div className="flex-1">
                <ProductionOperationView
                  machine={machine}
                  onSaveProductionLog={handleSaveProductionWithFeedback}
                />
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 9. PUNTO DE EQUILIBRIO & FINANZAS SCREEN             */}
          {/* ==================================================== */}
          {currentScreen === 'finanzas' && (
            <div className="p-4 sm:p-6 flex flex-col flex-1 pb-8">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Control Presupuestario & Finanzas</h2>
                  <span className="text-xs text-slate-500">{machine.code} • Presupuesto, Reemplazo y Rentabilidad</span>
                </div>
              </div>

              <div className="flex-1">
                <FinancialModule machine={machine} allMachines={allMachines} />
              </div>
            </div>
          )}

        </main>

        {/* Sticky Mobile Bottom Navigation Bar (Guarantees instant access to Admin & Salir) */}
        <nav className="sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around text-white shadow-2xl mt-auto w-full">
          <button
            type="button"
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
              currentScreen === 'home'
                ? 'text-cyan-400 bg-slate-800/90 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Inicio / Ficha de Máquina"
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">Máquina</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('produccion')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
              currentScreen === 'produccion'
                ? 'text-cyan-400 bg-slate-800/90 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Producción y Horas"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px]">Producción</span>
          </button>

          <button
            type="button"
            onClick={onOpenFiveSModal}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            title="Auditoría 5S"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px]">Auditoría 5S</span>
          </button>

          {onOpenAdminDashboard && (
            <button
              type="button"
              onClick={onOpenAdminDashboard}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-bold"
              title="Panel de Administración"
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-[10px]">Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-bold"
            title="Cerrar sesión / Salir"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="text-[10px]">Salir</span>
          </button>
        </nav>

        {/* Modal for fast production entry */}
        <QuickProductionModal
          isOpen={showQuickProdModal}
          onClose={() => setShowQuickProdModal(false)}
          machine={machine}
          operatorName={currentUser.name}
          onSaveProduction={handleSaveProductionWithFeedback}
        />

      </div>

    </div>
  );
};
