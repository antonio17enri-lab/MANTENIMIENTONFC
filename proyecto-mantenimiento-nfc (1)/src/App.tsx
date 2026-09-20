/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Smartphone,
  BarChart3,
  QrCode,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Machine, MaintenanceRecord, FailureReport, FiveSAudit } from './types';
import { INITIAL_MACHINES, INITIAL_STATIONS } from './data/initialMachines';
import { Header } from './components/Header';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';
import { DashboardIndicadores } from './components/DashboardIndicadores';
import { SystemWorkflowDiagram } from './components/SystemWorkflowDiagram';
import { NfcScannerModal } from './components/NfcScannerModal';
import { MaintenanceFormModal } from './components/MaintenanceFormModal';
import { FiveSChecklistModal } from './components/FiveSChecklistModal';
import { FailureReportModal } from './components/FailureReportModal';
import { NfcTagGeneratorModal } from './components/NfcTagGeneratorModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem('nfc_mantenimiento_machines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved machines:', e);
      }
    }
    return INITIAL_MACHINES;
  });

  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('m-001');
  const [currentView, setCurrentView] = useState<'full' | 'mobile' | 'dashboard' | 'tags'>('full');

  // Modal states
  const [isNfcScannerOpen, setIsNfcScannerOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isFiveSModalOpen, setIsFiveSModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [isTagGeneratorOpen, setIsTagGeneratorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Persist machines updates
  useEffect(() => {
    localStorage.setItem('nfc_mantenimiento_machines', JSON.stringify(machines));
  }, [machines]);

  const selectedMachine =
    machines.find((m) => m.id === selectedMachineId) || machines[0];

  // Handler: Select machine
  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    const m = machines.find((item) => item.id === machineId);
    if (m) {
      showToast(`Tag NFC leído: ${m.code} (${m.name})`, 'info');
    }
  };

  // Handler: Reset demo data
  const handleResetDemo = () => {
    if (window.confirm('¿Desea restablecer todos los datos al estado inicial de demostración?')) {
      setMachines(INITIAL_MACHINES);
      setStations(INITIAL_STATIONS);
      setSelectedMachineId('m-001');
      localStorage.removeItem('nfc_mantenimiento_machines');
      showToast('Datos de demostración restablecidos correctamente.', 'info');
    }
  };

  // Handler: Update machine status directly
  const handleUpdateStatus = (newStatus: Machine['status']) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === selectedMachine.id ? { ...m, status: newStatus } : m))
    );
    showToast(`Estado de ${selectedMachine.code} actualizado a: ${newStatus}`, 'info');
  };

  // Handler: Save maintenance
  const handleSaveMaintenance = (record: MaintenanceRecord, nextDate: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === selectedMachine.id) {
          return {
            ...m,
            status: 'OPERATIVA',
            lastMaintenanceDate: new Date().toISOString().split('T')[0],
            lastMaintenanceType: record.type,
            nextRevisionDate: nextDate,
            maintenanceHistory: [record, ...m.maintenanceHistory],
          };
        }
        return m;
      })
    );
    showToast(`Mantenimiento ${record.type} registrado con éxito para ${selectedMachine.code}.`);
  };

  // Handler: Save 5S audit
  const handleSaveAudit = (audit: FiveSAudit) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === selectedMachine.id) {
          return {
            ...m,
            latest5S: audit,
          };
        }
        return m;
      })
    );

    // Also update station score if appropriate
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === selectedMachine.stationId) {
          return {
            ...s,
            compliance5S: audit.generalCompliance,
          };
        }
        return s;
      })
    );

    showToast(`Auditoría 5S guardada: ${audit.generalCompliance}% de cumplimiento.`);
  };

  // Handler: Save failure
  const handleSaveFailure = (failure: FailureReport, stopMachine: boolean) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === selectedMachine.id) {
          return {
            ...m,
            status: stopMachine ? 'PARADA_FALLA' : m.status,
            failures: [failure, ...m.failures],
          };
        }
        return m;
      })
    );
    showToast(`Reporte de falla emitido para ${selectedMachine.code}.`, 'warn');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedMachine={selectedMachine}
        onSelectMachine={handleSelectMachine}
        machines={machines}
        onOpenNfcScanner={() => setIsNfcScannerOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetDemoData={handleResetDemo}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-600'
                : toastMessage.type === 'warn'
                ? 'bg-rose-800 text-white border-rose-600'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'warn' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Radio className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* VIEW 1: FULL INTEGRATED VIEW (INFOGRAPHIC LAYOUT) */}
        {currentView === 'full' && (
          <div className="space-y-8">
            
            {/* TOP SECTION: NFC Machine Reality + Mobile Terminal Simulator + Quick Selector */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left Column: Physical Machine & NFC Tag Interaction (matching left side of image) */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Interacción en Piso de Planta</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                      Punto de Contacto NFC en Maquinaria
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      El operario o auditor acerca su teléfono al tag industrial fijado en la máquina para abrir al instante la ficha digital, registrar mantenimientos preventivos o ejecutar auditorías 5S.
                    </p>
                  </div>

                  {/* Visual Machine Card with NFC Tag overlay (matching the lathe in image) */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-md group">
                    <img
                      src={selectedMachine.imageUrl}
                      alt={selectedMachine.name}
                      className="w-full h-52 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-between p-4">
                      
                      {/* Physical NFC Badge pinned to machine */}
                      <div className="self-start bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 flex items-center gap-2 shadow-lg">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-black text-[10px]">
                          N))
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">TAG INDUSTRIAL</div>
                          <div className="text-xs font-black font-mono tracking-wider">{selectedMachine.code}</div>
                        </div>
                      </div>

                      {/* Prompt banner matching the green tooltip in the photo */}
                      <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 text-slate-800 shadow-lg border border-slate-200 flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-bold leading-tight">
                          Acerca tu celular al tag NFC para acceder a la información de la máquina
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trigger buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setIsNfcScannerOpen(true)}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Simular Toque NFC</span>
                    </button>
                    <button
                      onClick={() => setIsTagGeneratorOpen(true)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver Etiqueta Placa</span>
                    </button>
                  </div>
                </div>

                {/* Middle Column: The Interactive Smartphone (All screens from diagram) */}
                <div className="lg:col-span-5 flex justify-center py-2">
                  <MobileDeviceSimulator
                    machine={selectedMachine}
                    onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
                    onOpenFiveSModal={() => setIsFiveSModalOpen(true)}
                    onOpenFailureModal={() => setIsFailureModalOpen(true)}
                    onTriggerNfcTap={() => setIsNfcScannerOpen(true)}
                    onUpdateMachineStatus={handleUpdateStatus}
                  />
                </div>

                {/* Right Column: Quick Machine Switcher & Real-Time Status Cards */}
                <div className="lg:col-span-3 flex flex-col space-y-3 h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Máquinas de la Planta
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {machines.length} activos
                      </span>
                    </div>

                    <div className="space-y-2">
                      {machines.map((m) => {
                        const isSelected = selectedMachine.id === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleSelectMachine(m.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  m.status === 'OPERATIVA'
                                    ? 'bg-emerald-500'
                                    : m.status === 'EN_REVISION'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              ></span>
                              <div>
                                <div className="font-mono font-bold text-xs text-slate-900">
                                  {m.code}
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium truncate max-w-[120px]">
                                  {m.name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                5S: {m.latest5S.generalCompliance}%
                              </span>
                              <span className="block text-[9px] text-slate-400 mt-0.5">
                                {m.stationId}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Quick Actions */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Acciones Rápidas:</span>
                    <button
                      onClick={() => setIsMaintenanceModalOpen(true)}
                      className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      + Registrar Mantenimiento
                    </button>
                    <button
                      onClick={() => setIsFiveSModalOpen(true)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      + Nueva Inspección 5S
                    </button>
                    <button
                      onClick={() => setIsFailureModalOpen(true)}
                      className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      + Reportar Falla
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* MIDDLE SECTION: Workflow Diagram & Process Flow */}
            <SystemWorkflowDiagram
              onTriggerScan={() => setIsNfcScannerOpen(true)}
              onOpenChecklist={() => setIsFiveSModalOpen(true)}
            />

            {/* BOTTOM SECTION: Live Dashboard of Indicators & KPIs */}
            <DashboardIndicadores
              machines={machines}
              stations={stations}
              onSelectMachine={handleSelectMachine}
              selectedMachineId={selectedMachine.id}
            />

          </div>
        )}

        {/* VIEW 2: FOCUSED OPERATOR MOBILE NFC TERMINAL */}
        {currentView === 'mobile' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Modo Pantalla Completa de Operador
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">
                Terminal Móvil NFC de Planta
              </h2>
              <p className="text-xs text-slate-500">
                Experiencia idéntica a la que experimenta el técnico al escanear la máquina en el taller.
              </p>
            </div>

            <MobileDeviceSimulator
              machine={selectedMachine}
              onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
              onOpenFiveSModal={() => setIsFiveSModalOpen(true)}
              onOpenFailureModal={() => setIsFailureModalOpen(true)}
              onTriggerNfcTap={() => setIsNfcScannerOpen(true)}
              onUpdateMachineStatus={handleUpdateStatus}
            />
          </div>
        )}

        {/* VIEW 3: PLANT DASHBOARD & REPORTING ONLY */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <DashboardIndicadores
              machines={machines}
              stations={stations}
              onSelectMachine={handleSelectMachine}
              selectedMachineId={selectedMachine.id}
            />
            <SystemWorkflowDiagram
              onTriggerScan={() => setIsNfcScannerOpen(true)}
              onOpenChecklist={() => setIsFiveSModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 4: PHYSICAL NFC/QR TAGS GENERATOR */}
        {currentView === 'tags' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Placas y Etiquetas Industriales NFC / QR
                  </h2>
                  <p className="text-xs text-slate-500">
                    Genera e imprime etiquetas para adherir o remachar directamente en el bastidor de cada equipo.
                  </p>
                </div>
                <button
                  onClick={() => setIsTagGeneratorOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Configurar e Imprimir</span>
                </button>
              </div>

              {/* Grid of tags for all machines */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMachineId(m.id);
                      setIsTagGeneratorOpen(true);
                    }}
                    className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-black text-xs">
                          N))
                        </div>
                        <span className="font-mono text-sm font-black text-slate-900">{m.code}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {m.location}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 mb-1">{m.name}</div>
                    <div className="text-[11px] text-slate-500 mb-3">{m.brand} {m.model}</div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                      <span>Ver placa para imprimir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <Radio className="w-4 h-4 text-blue-600" />
            <span>Sistema Inteligente de Mantenimiento y 5S con NFC • Planta Digital</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span>ISO 9001 / Kaizen Ready</span>
            <span>•</span>
            <span>NFC NTAG213 / ISO 14443A</span>
            <span>•</span>
            <span>Looker Studio Sync</span>
          </div>
        </div>
      </footer>

      {/* ALL MODALS */}
      <NfcScannerModal
        isOpen={isNfcScannerOpen}
        onClose={() => setIsNfcScannerOpen(false)}
        machines={machines}
        onSelectMachine={handleSelectMachine}
        activeMachine={selectedMachine}
      />

      <MaintenanceFormModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        machine={selectedMachine}
        onSaveMaintenance={handleSaveMaintenance}
      />

      <FiveSChecklistModal
        isOpen={isFiveSModalOpen}
        onClose={() => setIsFiveSModalOpen(false)}
        machine={selectedMachine}
        onSaveAudit={handleSaveAudit}
      />

      <FailureReportModal
        isOpen={isFailureModalOpen}
        onClose={() => setIsFailureModalOpen(false)}
        machine={selectedMachine}
        onSaveFailure={handleSaveFailure}
      />

      <NfcTagGeneratorModal
        isOpen={isTagGeneratorOpen}
        onClose={() => setIsTagGeneratorOpen(false)}
        machines={machines}
        activeMachine={selectedMachine}
        onSelectMachine={handleSelectMachine}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        machines={machines}
      />
    </div>
  );
}
