/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Radio,
  Smartphone,
  Layers,
  BarChart3,
  DollarSign,
  Users,
  PlusCircle,
  RotateCcw,
  Shield,
  User,
  LogOut,
  Tag,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Download,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  Clock,
  Wrench
} from 'lucide-react';
import { Machine, MaintenanceRecord, FailureReport, FiveSAudit, ProductionLog, AppUser } from './types';
import { INITIAL_MACHINES, INITIAL_STATIONS } from './data/initialMachines';
import { OperatorMainApp } from './components/OperatorMainApp';
import { LoginScreen } from './components/LoginScreen';
import { DashboardIndicadores } from './components/DashboardIndicadores';
import { SystemWorkflowDiagram } from './components/SystemWorkflowDiagram';
import { FinancialModule } from './components/FinancialModule';
import { NewMachineModal } from './components/NewMachineModal';
import { NfcConfigModal } from './components/NfcConfigModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { NfcScannerModal } from './components/NfcScannerModal';
import { MaintenanceFormModal } from './components/MaintenanceFormModal';
import { FiveSChecklistModal } from './components/FiveSChecklistModal';
import { FailureReportModal } from './components/FailureReportModal';
import { DownloadModal } from './components/DownloadModal';
import { AuthModal } from './components/AuthModal';
import { OperatorManagementModal } from './components/OperatorManagementModal';
import { TagOpsLogo } from './components/TagOpsLogo';

// Initial Demo Users
const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-admin',
    name: 'Administrador General',
    username: 'admin',
    role: 'admin',
    passwordHash: 'admin123',
    createdAt: '2024-01-01',
  },
  {
    id: 'usr-operador-1',
    name: 'Juan Pérez (Operario Torno)',
    username: 'operador',
    role: 'operador',
    passwordHash: 'operador123',
    assignedMachineCode: 'M-001',
    createdAt: '2024-01-15',
  },
  {
    id: 'usr-operador-2',
    name: 'Carlos Silva (Operario Fresado)',
    username: 'csilva',
    role: 'operador',
    passwordHash: 'silva2024',
    assignedMachineCode: 'M-002',
    createdAt: '2024-02-01',
  },
];

export default function App() {
  // Machine Data State
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

  // Navigation: 'terminal' | 'dashboard' | 'financials'
  const [activeScreen, setActiveScreen] = useState<'terminal' | 'dashboard' | 'financials'>('terminal');

  // User Management & Security State
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('tagops_users_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved users:', e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('tagops_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing current user:', e);
      }
    }
    // User must log in first with username and password
    return null;
  });

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRequiredMessage, setAuthRequiredMessage] = useState<string | undefined>(undefined);
  const [authRequireAdminOnly, setAuthRequireAdminOnly] = useState(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isNfcScannerOpen, setIsNfcScannerOpen] = useState(false);
  const [isNewMachineModalOpen, setIsNewMachineModalOpen] = useState(false);
  const [isNfcConfigModalOpen, setIsNfcConfigModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isFiveSModalOpen, setIsFiveSModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // URL Query Parameter Detection (for physical NFC Tags: ?maquina=M-001)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const machineParam = params.get('maquina') || params.get('machine');
      if (machineParam) {
        const found = machines.find(
          (m) => m.code.toUpperCase() === machineParam.toUpperCase() || m.id === machineParam.toLowerCase()
        );
        if (found) {
          setSelectedMachineId(found.id);
          setActiveScreen('terminal');
          showToast(`¡Tag NFC detectado! Accediendo a ${found.code} (${found.name})`, 'success');
        }
      }
    }
  }, [machines]);

  // Persist machines updates
  useEffect(() => {
    localStorage.setItem('nfc_mantenimiento_machines', JSON.stringify(machines));
  }, [machines]);

  // Persist users updates
  useEffect(() => {
    localStorage.setItem('tagops_users_v2', JSON.stringify(users));
  }, [users]);

  // Persist current session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tagops_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tagops_current_user');
    }
  }, [currentUser]);

  const selectedMachine =
    machines.find((m) => m.id === selectedMachineId) || machines[0] || INITIAL_MACHINES[0];

  // Handler: Select machine
  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachineId(machine.id);
    showToast(`Máquina seleccionada: ${machine.code} (${machine.name})`, 'info');
  };

  // Security Helper: Check Admin Rights
  const requireAdmin = (actionDesc: string, callback: () => void) => {
    if (!currentUser) {
      setAuthRequiredMessage(`Para ${actionDesc} debes iniciar sesión como Administrador.`);
      setAuthRequireAdminOnly(true);
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role !== 'admin') {
      showToast(`Acceso denegado: Se requieren permisos de Administrador para ${actionDesc}.`, 'warn');
      setAuthRequiredMessage(`Para ${actionDesc} debes iniciar sesión con la cuenta de Administrador.`);
      setAuthRequireAdminOnly(true);
      setIsAuthModalOpen(true);
      return;
    }
    callback();
  };

  // Handler: Save newly created machine
  const handleSaveNewMachine = (newMachine: Machine) => {
    setMachines((prev) => [newMachine, ...prev]);
    setSelectedMachineId(newMachine.id);
    showToast(`Máquina ${newMachine.code} registrada con cálculo de equilibrio exitoso.`, 'success');
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
    showToast(`Mantenimiento registrado para ${selectedMachine.code}.`);
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
    showToast(`Reporte de avería emitido para ${selectedMachine.code}.`, 'warn');
  };

  // Handler: Save production shift log
  const handleSaveProductionLog = (log: ProductionLog) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === selectedMachine.id) {
          const currentMetrics = m.productionMetrics || {
            availableHours: 160,
            workedHours: 0,
            stoppedHours: 0,
            producedUnits: 0,
            expectedUnits: 600,
          };

          const updatedMetrics = {
            ...currentMetrics,
            workedHours: currentMetrics.workedHours + log.hoursWorked,
            stoppedHours: currentMetrics.stoppedHours + log.hoursStopped,
            producedUnits: currentMetrics.producedUnits + log.unitsProduced,
          };

          return {
            ...m,
            productionMetrics: updatedMetrics,
            productionHistory: [log, ...(m.productionHistory || [])],
          };
        }
        return m;
      })
    );
    showToast(`Turno de producción registrado para ${selectedMachine.code}.`, 'success');
  };

  // Handler: User Management callbacks
  const handleAddUser = (newUser: AppUser) => {
    setUsers((prev) => [...prev, newUser]);
    showToast(`Operario "${newUser.name}" habilitado en el sistema.`, 'success');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('Operario eliminado del sistema.', 'info');
  };

  const handleChangeAdminPassword = (newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.role === 'admin' ? { ...u, passwordHash: newPass } : u))
    );
    localStorage.setItem('tagops_admin_password', newPass);
    showToast('Contraseña maestra de Administrador actualizada exitosamente.', 'success');
  };

  // Handler: Reset to Demo
  const handleConfirmResetDemo = () => {
    setMachines(INITIAL_MACHINES);
    setStations(INITIAL_STATIONS);
    setSelectedMachineId('m-001');
    localStorage.removeItem('nfc_mantenimiento_machines');
    showToast('Base de datos restaurada al modo inicial de demostración.', 'info');
  };

  // Handler: Full wipe
  const handleConfirmWipeAll = () => {
    setMachines([]);
    localStorage.removeItem('nfc_mantenimiento_machines');
    showToast('Todos los datos han sido eliminados.', 'warn');
  };

  // ENFORCE AUTHENTICATION SCREEN ON STARTUP (PASSWORD AND USERNAME REQUIRED)
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`¡Bienvenido, ${user.name}! Sesión iniciada.`, 'success');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {activeScreen === 'terminal' ? (
        /* NATIVE OPERATOR INTERFACE FOR MOBILE & TABLET (NO SIMULATED PHONE FRAME) */
        <OperatorMainApp
          machine={selectedMachine}
          allMachines={machines}
          currentUser={currentUser}
          onSelectMachine={handleSelectMachine}
          onUpdateMachineStatus={handleUpdateStatus}
          onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
          onOpenFailureModal={() => setIsFailureModalOpen(true)}
          onOpenFiveSModal={() => setIsFiveSModalOpen(true)}
          onOpenNfcConfig={() => setIsNfcScannerOpen(true)}
          onSaveProductionLog={handleSaveProductionLog}
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem('tagops_current_user');
            showToast('Sesión cerrada correctamente.', 'info');
          }}
          onOpenAdminDashboard={
            currentUser.role === 'admin'
              ? () => setActiveScreen('dashboard')
              : undefined
          }
        />
      ) : (
        /* SUPERVISOR / ADMIN VIEWS (DASHBOARD & FINANZAS) */
        <>
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
            {/* Upper Brand & Title Bar */}
            <div className="border-b border-slate-100 px-4 py-2.5 sm:px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 self-start md:self-center">
                  <TagOpsLogo size="md" showSubtitle={false} />
                  <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <h1 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                      SISTEMA INTELIGENTE DE MANTENIMIENTO Y 5S CON NFC
                    </h1>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                      Panel de Administración e Indicadores de Planta
                    </p>
                  </div>
                </div>

                {/* Right: Return to Operator Mode & Session */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    id="btn-return-operator"
                    onClick={() => setActiveScreen('terminal')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Volver a Terminal Operario</span>
                  </button>

                  <button
                    id="btn-scan-nfc"
                    onClick={() => setIsNfcScannerOpen(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Escanear o Simular Tag NFC"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span>Escanear NFC</span>
                  </button>

                  {/* User Session Chip */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                    <span className="flex items-center gap-1 font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md text-[10px]">
                      <Shield className="w-3 h-3 text-blue-700" /> ADMIN
                    </span>
                    <span className="font-semibold text-slate-700 max-w-[120px] truncate hidden sm:inline">
                      {currentUser.name}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentUser(null);
                        localStorage.removeItem('tagops_current_user');
                        showToast('Sesión cerrada correctamente.', 'info');
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower Navigation & Controls Bar */}
            <div className="px-4 py-2 sm:px-6 bg-slate-50/70">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                {/* View Switching Navigation Tabs */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    id="nav-tab-dashboard"
                    onClick={() => setActiveScreen('dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeScreen === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Dashboard de Indicadores</span>
                  </button>

                  <button
                    id="nav-tab-financials"
                    onClick={() => setActiveScreen('financials')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeScreen === 'financials'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Punto de Equilibrio</span>
                  </button>
                </div>

                {/* Admin Management Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-admin-operadores"
                    onClick={() => {
                      requireAdmin('gestionar operarios y seguridad', () => {
                        setIsOperatorModalOpen(true);
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Gestión de Operarios y Contraseña Maestra"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Operarios</span>
                  </button>

                  <button
                    id="btn-admin-nueva-maquina"
                    onClick={() => {
                      requireAdmin('agregar una nueva máquina', () => {
                        setIsNewMachineModalOpen(true);
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Registrar Nueva Máquina y Parámetros Financieros"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">+ Máquina</span>
                  </button>

                  <button
                    id="btn-admin-reiniciar"
                    onClick={() => {
                      requireAdmin('reiniciar o borrar datos', () => {
                        setIsResetPasswordModalOpen(true);
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reiniciar Datos (Protegido por contraseña)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Reiniciar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Machine Selector Pills */}
            <div className="px-4 py-2 sm:px-6 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none">
              <div className="max-w-7xl mx-auto flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Máquinas:
                </span>
                <div className="flex items-center gap-1.5">
                  {machines.map((m) => {
                    const isSelected = m.id === selectedMachine.id;
                    const statusDotColor =
                      m.status === 'OPERATIVA'
                        ? 'bg-emerald-500'
                        : m.status === 'EN_REVISION'
                        ? 'bg-amber-500'
                        : 'bg-rose-500';

                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMachine(m)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                        <span className="font-mono">{m.code}</span>
                        <span className="text-slate-500 font-normal hidden md:inline truncate max-w-[100px]">
                          {m.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT FOR ADMIN */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* VIEW B: DASHBOARD DE INDICADORES (Requested comprehensive view) */}
        {activeScreen === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Dashboard Title & Quick Stats */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">
                  SUPERVISIÓN GENERAL DE PLANTA
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Dashboard Integral de Indicadores
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Métricas agregadas de mantenimiento, auditorías 5S, horas de producción y disponibilidad de maquinaria
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNfcScannerOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Radio className="w-4 h-4 text-cyan-200 animate-pulse" />
                  <span>Escanear Máquina</span>
                </button>
              </div>
            </div>

            {/* Complete Indicators Dashboard Component */}
            <DashboardIndicadores
              machines={machines}
              stations={stations}
              onSelectMachine={(mId) => {
                setSelectedMachineId(mId);
                setActiveScreen('terminal');
              }}
              selectedMachineId={selectedMachine.id}
            />

            {/* Detailed Table of All Machines with Financial & Production Status */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    Inventario y Estado de Maquinaria de Planta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Resumen consolidado por equipo, estación y parámetros de equilibrio
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  Total: {machines.length} equipos
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold bg-slate-50/50">
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Equipo / Modelo</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Auditoría 5S</th>
                      <th className="py-2.5 px-3">Producción</th>
                      <th className="py-2.5 px-3">Costo Fijo (Q)</th>
                      <th className="py-2.5 px-3">P. Equilibrio</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {machines.map((m) => {
                      const breakEvenUnits =
                        m.financials && m.financials.salePricePerUnit > m.financials.variableCostPerUnit
                          ? Math.round(
                              m.financials.monthlyFixedCost /
                                (m.financials.salePricePerUnit - m.financials.variableCostPerUnit)
                            )
                          : 600;

                      const producedUnits = m.productionMetrics?.producedUnits ?? 540;
                      const isProfit = producedUnits >= breakEvenUnits;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono font-black text-slate-900">
                            {m.code}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 block">{m.name}</span>
                            <span className="text-[10px] text-slate-400">
                              {m.brand} • {m.location}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === 'OPERATIVA'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'EN_REVISION'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800">
                              {m.latest5S.generalCompliance}%
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            {producedUnits} unid
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            Q{m.financials?.monthlyFixedCost.toLocaleString() ?? '15,000'}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                isProfit
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {breakEvenUnits} unid {isProfit ? '🟢' : '🔴'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedMachineId(m.id);
                                setActiveScreen('terminal');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Inspeccionar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Workflow Diagram */}
            <SystemWorkflowDiagram
              onTriggerScan={() => setIsNfcScannerOpen(true)}
              onOpenChecklist={() => setIsFiveSModalOpen(true)}
            />

          </div>
        )}

        {/* VIEW C: PUNTO DE EQUILIBRIO & FINANZAS (Full Financial Module) */}
        {activeScreen === 'financials' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">
                  ANÁLISIS FINANCIERO Y COSTOS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Punto de Equilibrio y Rentabilidad Operativa
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cálculo automático de unidades y ventas mínimas para cubrir costos fijos y variables
                </p>
              </div>

              {/* Machine Selector for Financial Analysis */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Máquina:</span>
                <select
                  value={selectedMachine.id}
                  onChange={(e) => {
                    const found = machines.find((m) => m.id === e.target.value);
                    if (found) setSelectedMachineId(found.id);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financial Module Component */}
            <FinancialModule machine={selectedMachine} allMachines={machines} />
          </div>
        )}

      </main>
        </>
      )}

      {/* 3. TOAST NOTIFICATIONS */}
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

      {/* 4. MODALS & DIALOGS */}

      {/* Authentication & User Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`¡Bienvenido, ${user.name}! Sesión iniciada.`, 'success');
        }}
        users={users}
        requiredActionDescription={authRequiredMessage}
        requireAdmin={authRequireAdminOnly}
      />

      {/* Admin Operator Management Modal */}
      {currentUser && (
        <OperatorManagementModal
          isOpen={isOperatorModalOpen}
          onClose={() => setIsOperatorModalOpen(false)}
          users={users}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onChangeAdminPassword={handleChangeAdminPassword}
          machines={machines}
          currentUser={currentUser}
        />
      )}

      {/* New Machine Registration & NFC Setup Modal */}
      <NewMachineModal
        isOpen={isNewMachineModalOpen}
        onClose={() => setIsNewMachineModalOpen(false)}
        onSaveMachine={handleSaveNewMachine}
        existingCount={machines.length}
      />

      {/* NFC Configuration & Writing Modal */}
      <NfcConfigModal
        isOpen={isNfcConfigModalOpen}
        onClose={() => setIsNfcConfigModalOpen(false)}
        machines={machines}
        initialMachineCode={selectedMachine?.code}
      />

      {/* Password-Protected Reset Data Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onConfirmResetDemo={handleConfirmResetDemo}
        onConfirmWipeAll={handleConfirmWipeAll}
      />

      {/* NFC Scanner / Tap Simulation Modal */}
      <NfcScannerModal
        isOpen={isNfcScannerOpen}
        onClose={() => setIsNfcScannerOpen(false)}
        machines={machines}
        onSelectMachine={(mId) => {
          setSelectedMachineId(mId);
          setActiveScreen('terminal');
        }}
        activeMachine={selectedMachine}
      />

      {/* Maintenance Form Modal */}
      {selectedMachine && (
        <MaintenanceFormModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          machine={selectedMachine}
          onSaveMaintenance={handleSaveMaintenance}
        />
      )}

      {/* 5S Checklist Modal */}
      {selectedMachine && (
        <FiveSChecklistModal
          isOpen={isFiveSModalOpen}
          onClose={() => setIsFiveSModalOpen(false)}
          machine={selectedMachine}
          onSaveAudit={handleSaveAudit}
        />
      )}

      {/* Failure Report Modal */}
      {selectedMachine && (
        <FailureReportModal
          isOpen={isFailureModalOpen}
          onClose={() => setIsFailureModalOpen(false)}
          machine={selectedMachine}
          onSaveFailure={handleSaveFailure}
        />
      )}

      {/* Source Code Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

    </div>
  );
}
