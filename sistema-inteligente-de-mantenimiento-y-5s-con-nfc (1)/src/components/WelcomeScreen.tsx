import React, { useState } from 'react';
import { Radio, QrCode, Search, PlusCircle, Settings, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Wrench, DollarSign, KeyRound, Clock } from 'lucide-react';
import { Machine } from '../types';
import { TagOpsLogo } from './TagOpsLogo';

interface WelcomeScreenProps {
  machines: Machine[];
  onSelectMachine: (machine: Machine) => void;
  onOpenNewMachine: () => void;
  onOpenNfcConfig: () => void;
  onOpenFinancials: () => void;
  onOpenResetPassword: () => void;
  onStartNfcScan: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  machines,
  onSelectMachine,
  onOpenNewMachine,
  onOpenNfcConfig,
  onOpenFinancials,
  onOpenResetPassword,
  onStartNfcScan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  const categories = ['TODAS', ...Array.from(new Set(machines.map((m) => m.category)))];

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'TODAS' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'OPERATIVA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Operativa
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> En Revisión
          </span>
        );
      case 'PARADA_FALLA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" /> Parada / Falla
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Industrial Operator Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <TagOpsLogo size="md" showSubtitle={true} />

          {/* Quick Management Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenFinancials}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Punto de Equilibrio y Finanzas"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Punto de Equilibrio</span>
            </button>

            <button
              onClick={onOpenNfcConfig}
              className="px-2.5 sm:px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-cyan-300 border border-blue-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Configurar Etiquetas NFC"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden sm:inline">Configurar NFC</span>
            </button>

            <button
              onClick={onOpenNewMachine}
              className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title="Registrar Nueva Máquina"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Máquina</span>
            </button>

            <button
              onClick={onOpenResetPassword}
              className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Reiniciar Datos (Requiere Contraseña)"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Welcome & NFC Action Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl text-white">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              TERMINAL DE INSPECCIÓN EN PLANTA
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              ¡Bienvenido! Empecemos con la inspección.
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Acerca tu teléfono a la etiqueta NFC fijada en la máquina para ingresar directamente a su ficha técnica, bitácora de mantenimiento, auditoría 5S, reporte de averías y control de producción.
            </p>

            {/* Primary Tactile NFC Action Button */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartNfcScan}
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl text-sm shadow-xl flex items-center gap-3 transition-all transform active:scale-95 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-950 text-cyan-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <span>Escanear Tag NFC o Simular Lectura</span>
              </button>

              <button
                onClick={onOpenNfcConfig}
                className="px-4 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-slate-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                ¿Cómo grabar mis etiquetas NFC?
              </button>
            </div>
          </div>

          {/* Background Decorative Tech Element */}
          <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
            <Radio className="w-72 h-72 text-cyan-400" />
          </div>
        </div>

        {/* Machine Quick Selection Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Acceso Rápido a Máquinas Registradas</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-cyan-300 font-mono font-bold">
                  {machines.length} equipos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona cualquier máquina para ingresar a sus funciones operativas
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nombre o área..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Machines Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMachines.map((machine) => (
              <div
                key={machine.id}
                onClick={() => onSelectMachine(machine)}
                className="group p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-cyan-300 text-sm tracking-wide">
                          {machine.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {machine.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-100 mt-1 line-clamp-1 group-hover:text-cyan-200 transition-colors">
                        {machine.name}
                      </h3>
                    </div>

                    {getStatusBadge(machine.status)}
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Ubicación:</span>
                      <span className="font-medium text-slate-200">{machine.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Responsable:</span>
                      <span className="font-medium text-slate-200">{machine.responsible}</span>
                    </div>
                    {machine.productionMetrics && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                        <span className="text-blue-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Horas:
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {machine.productionMetrics.workedHours}h trab. / {machine.productionMetrics.producedUnits} unid
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-cyan-300">
                  <span>Abrir Inspección Técnica</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {filteredMachines.length === 0 && (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No se encontraron máquinas que coincidan con la búsqueda.
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-[11px] text-slate-500">
        TAG OPS • Terminal de Operario & Planta Industrial • Compatible con Etiquetas NFC Físicas (NTAG213 / NTAG215)
      </footer>

    </div>
  );
};
