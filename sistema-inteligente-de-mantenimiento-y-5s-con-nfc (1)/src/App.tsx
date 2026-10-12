/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Wrench,
  Camera,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { Machine, MaintenanceRecord, FailureReport, FiveSAudit, ProductionLog, AppUser } from './types';
import { INITIAL_MACHINES, INITIAL_STATIONS } from './data/initialMachines';
import { INITIAL_USERS } from './data/initialUsers';
import {
  fetchServerData,
  syncMachinesToServer,
  syncUsersToServer,
  checkServerStatus,
  resetServerDatabase,
} from './services/apiSync';
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
import { GoogleSheetsModule } from './components/GoogleSheetsModule';
import { ChangeMachinePhotoModal } from './components/ChangeMachinePhotoModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { UserManualModal } from './components/UserManualModal';


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

  // Navigation: 'terminal' | 'dashboard' | 'financials' | 'googlesheets'
  const [activeScreen, setActiveScreen] = useState<'terminal' | 'dashboard' | 'financials' | 'googlesheets'>('terminal');

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
  const [selectedNfcMachineCode, setSelectedNfcMachineCode] = useState<string>('M-001');
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isFiveSModalOpen, setIsFiveSModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [photoModalMachine, setPhotoModalMachine] = useState<Machine | null>(null);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);

  const handleUpdateMachinePhoto = (machineId: string, newImageUrl: string) => {
    setMachines((prev) => {
      const updated = prev.map((m) => (m.id === machineId ? { ...m, imageUrl: newImageUrl } : m));
      localStorage.setItem('nfc_mantenimiento_machines', JSON.stringify(updated));
      return updated;
    });
    showToast('¡Foto de la máquina actualizada con éxito!', 'success');
  };

  // Helper to open NFC writer with a specific machine code preselected
  const handleOpenNfcWriterForMachine = (code?: string) => {
    if (code) {
      setSelectedNfcMachineCode(code);
    } else if (selectedMachine) {
      setSelectedNfcMachineCode(selectedMachine.code);
    }
    setIsNfcConfigModalOpen(true);
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // URL Query Parameter Detection (for physical NFC Tags: ?maquina=M-001)
  // Only detect on initial arrival, then clean URL search parameter so subsequent state updates (e.g. changing status to Revision/Falla) do NOT reset the selected machine
  const hasProcessedUrlNfcRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !hasProcessedUrlNfcRef.current) {
      const params = new URLSearchParams(window.location.search);
      const machineParam = params.get('maquina') || params.get('machine');
      if (machineParam) {
        hasProcessedUrlNfcRef.current = true;
        const found = machines.find(
          (m) => m.code.toUpperCase() === machineParam.toUpperCase() || m.id === machineParam.toLowerCase()
        );
        if (found) {
          setSelectedMachineId(found.id);
          setActiveScreen('terminal');
          showToast(`¡Tag NFC detectado! Accediendo a ${found.code} (${found.name})`, 'success');
        }
        // Remove ?maquina=... from browser URL without reloading so status updates or switching machines won't re-trigger it
        try {
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', cleanUrl);
        } catch (e) {
          // ignore if history.replaceState is not permitted
        }
      }
    }
  }, []);

  // Central Server Synchronization State
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'syncing'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Iniciando...');
  const isReceivingFromServerRef = useRef(false);
  const lastRemoteTimestampRef = useRef<number>(0);

  // Initial fetch from central server and background polling for multi-device sync
  useEffect(() => {
    let isMounted = true;

    async function initialSync() {
      try {
        setServerStatus('syncing');
        const data = await fetchServerData();
        if (isMounted && data && Array.isArray(data.machines) && data.machines.length > 0) {
          isReceivingFromServerRef.current = true;
          setMachines(data.machines);
          if (Array.isArray(data.users) && data.users.length > 0) {
            setUsers(data.users);
          }
          if (Array.isArray(data.stations) && data.stations.length > 0) {
            setStations(data.stations);
          }
          lastRemoteTimestampRef.current = data.updatedAt || Date.now();
          setServerStatus('online');
          setLastSyncTime(
            new Date(data.updatedAt || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        } else if (isMounted) {
          // Push initial data to central server if needed
          await syncMachinesToServer(machines);
          await syncUsersToServer(users);
          setServerStatus('online');
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } catch (err) {
        console.warn('[Sync] Offline mode fallback:', err);
        if (isMounted) setServerStatus('offline');
      }
    }

    initialSync();

    // Multi-device polling: every 4 seconds check if another phone/tablet made changes
    const pollInterval = setInterval(async () => {
      try {
        const status = await checkServerStatus();
        if (status.status === 'online') {
          setServerStatus('online');
          if (status.updatedAt && status.updatedAt > lastRemoteTimestampRef.current) {
            // New changes from mobile or tablet! Fetch fresh data
            const freshData = await fetchServerData();
            if (freshData && Array.isArray(freshData.machines)) {
              isReceivingFromServerRef.current = true;
              setMachines(freshData.machines);
              if (Array.isArray(freshData.users)) setUsers(freshData.users);
              if (Array.isArray(freshData.stations)) setStations(freshData.stations);
              lastRemoteTimestampRef.current = freshData.updatedAt;
              setLastSyncTime(
                new Date(freshData.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              );
            }
          }
        } else {
          setServerStatus('offline');
        }
      } catch {
        setServerStatus('offline');
      }
    }, 4000);

    const onWindowFocus = async () => {
      try {
        const freshData = await fetchServerData();
        if (freshData && freshData.updatedAt && freshData.updatedAt > lastRemoteTimestampRef.current) {
          isReceivingFromServerRef.current = true;
          setMachines(freshData.machines);
          if (Array.isArray(freshData.users)) setUsers(freshData.users);
          lastRemoteTimestampRef.current = freshData.updatedAt;
          setServerStatus('online');
          setLastSyncTime(
            new Date(freshData.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      } catch {
        // silent
      }
    };

    window.addEventListener('focus', onWindowFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, []);

  // When machines update locally (operator or admin action)
  useEffect(() => {
    localStorage.setItem('nfc_mantenimiento_machines', JSON.stringify(machines));

    if (isReceivingFromServerRef.current) {
      isReceivingFromServerRef.current = false;
      return;
    }

    // Push local updates to central server database
    syncMachinesToServer(machines).then((ok) => {
      if (ok) {
        lastRemoteTimestampRef.current = Date.now();
        setServerStatus('online');
        setLastSyncTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    });
  }, [machines]);

  // When users update locally
  useEffect(() => {
    localStorage.setItem('tagops_users_v2', JSON.stringify(users));

    if (isReceivingFromServerRef.current) {
      isReceivingFromServerRef.current = false;
      return;
    }

    syncUsersToServer(users);
  }, [users]);

  // Persist current session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tagops_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tagops_current_user');
    }
  }, [currentUser]);

  // Manual immediate synchronization trigger
  const handleTriggerManualSync = async () => {
    setServerStatus('syncing');
    try {
      const data = await fetchServerData();
      if (data && Array.isArray(data.machines)) {
        isReceivingFromServerRef.current = true;
        setMachines(data.machines);
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.stations)) setStations(data.stations);
        lastRemoteTimestampRef.current = data.updatedAt || Date.now();
        setServerStatus('online');
        setLastSyncTime(
          new Date(data.updatedAt || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
        showToast('Sincronizado con el servidor central de planta.', 'success');
      } else {
        setServerStatus('offline');
        showToast('Servidor no disponible, trabajando en modo local.', 'warn');
      }
    } catch {
      setServerStatus('offline');
      showToast('Error al conectar con el servidor central.', 'warn');
    }
  };

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

  // Handler: Update machine financial and budget parameters
  const handleUpdateMachineFinancials = (
    machineId: string,
    updatedFields: Partial<NonNullable<Machine['financials']>>
  ) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            financials: {
              ...(m.financials || {
                monthlyFixedCost: 15000,
                variableCostPerUnit: 25,
                salePricePerUnit: 50,
                expectedUnitsPerMonth: 600,
              }),
              ...updatedFields,
            },
          };
        }
        return m;
      })
    );
    showToast('Parámetros presupuestarios y de reemplazo actualizados con éxito.', 'success');
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
    resetServerDatabase().catch(() => {});
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
      <>
        <LoginScreen
          users={users}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast(`¡Bienvenido, ${user.name}! Sesión iniciada.`, 'success');
          }}
          onOpenUserManual={() => setIsUserManualOpen(true)}
        />
        <UserManualModal
          isOpen={isUserManualOpen}
          onClose={() => setIsUserManualOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white w-full max-w-full overflow-x-hidden">
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
          onOpenNfcWriter={(mCode) => handleOpenNfcWriterForMachine(mCode || selectedMachine?.code)}
          onOpenChangePhoto={(m) => setPhotoModalMachine(m)}
          onSaveProductionLog={handleSaveProductionLog}
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem('tagops_current_user');
            showToast('Sesión cerrada correctamente.', 'info');
          }}
          onOpenAdminDashboard={() => {
            if (currentUser.role === 'admin') {
              setActiveScreen('dashboard');
            } else {
              setIsAdminPasswordModalOpen(true);
            }
          }}
          onOpenUserManual={() => setIsUserManualOpen(true)}
          serverStatus={serverStatus}
          lastSyncTime={lastSyncTime}
          onTriggerSync={handleTriggerManualSync}
        />
      ) : (
        /* SUPERVISOR / ADMIN VIEWS (DASHBOARD & FINANZAS) */
        <>
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs w-full max-w-full overflow-hidden">
            {/* Upper Brand & Title Bar - Fully responsive for mobile/tablet */}
            <div className="border-b border-slate-100 px-3 py-2.5 sm:px-6 w-full max-w-full">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 w-full min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 w-full md:w-auto">
                  <TagOpsLogo size="md" showSubtitle={false} />
                  <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight truncate sm:whitespace-normal">
                        SISTEMA INTELIGENTE DE MANTENIMIENTO Y 5S CON NFC
                      </h1>
                      <button
                        onClick={handleTriggerManualSync}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-2xs ${
                          serverStatus === 'online'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : serverStatus === 'syncing'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                        title={`Sincronización central: ${lastSyncTime}. Clic para forzar actualización inmediata.`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            serverStatus === 'online'
                              ? 'bg-emerald-500'
                              : serverStatus === 'syncing'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <RefreshCw
                          className={`w-2.5 h-2.5 ${serverStatus === 'syncing' ? 'animate-spin' : ''}`}
                        />
                        <span>
                          {serverStatus === 'online'
                            ? `Servidor Central (${lastSyncTime})`
                            : serverStatus === 'syncing'
                            ? 'Sincronizando...'
                            : 'Modo Local'}
                        </span>
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                      Panel de Administración e Indicadores de Planta • Sincronización Full-Stack en vivo
                    </p>
                  </div>
                </div>

                {/* Right: Return to Operator Mode, NFC Actions & Session */}
                <div className="flex flex-wrap items-center justify-start md:justify-end gap-1.5 w-full md:w-auto min-w-0">
                  <button
                    id="btn-return-operator"
                    onClick={() => setActiveScreen('terminal')}
                    className="px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Terminal Operario</span>
                  </button>

                  <button
                    id="btn-admin-grabar-nfc-top"
                    onClick={() => handleOpenNfcWriterForMachine(selectedMachine.code)}
                    className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                    title="Grabar o programar etiquetas NFC para las máquinas M-001 a M-006"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                    <span>Grabar NFC</span>
                  </button>

                  <button
                    id="btn-scan-nfc"
                    onClick={() => setIsNfcScannerOpen(true)}
                    className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                    title="Escanear o Simular Tag NFC"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="hidden xs:inline">Escanear</span>
                  </button>

                  {/* User Session Chip & Salir Button */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs shrink-0 ml-auto md:ml-0">
                    <span className="flex items-center gap-1 font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-md text-[10px]">
                      <Shield className="w-3 h-3 text-blue-700" /> {currentUser.role === 'admin' ? 'ADMIN' : 'OPERADOR'}
                    </span>
                    <span className="font-semibold text-slate-700 max-w-[80px] sm:max-w-[120px] truncate">
                      {currentUser.name}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentUser(null);
                        localStorage.removeItem('tagops_current_user');
                        showToast('Sesión cerrada correctamente.', 'info');
                      }}
                      className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Cerrar sesión / Salir"
                    >
                      <LogOut className="w-3 h-3 text-rose-600" />
                      <span>Salir</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower Navigation & Controls Bar */}
            <div className="px-3 py-2 sm:px-6 bg-slate-50/70 w-full max-w-full">
              <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 w-full min-w-0">
                {/* View Switching Navigation Tabs */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto max-w-full scrollbar-thin shrink-0">
                  <button
                    id="nav-tab-dashboard"
                    onClick={() => setActiveScreen('dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      activeScreen === 'financials'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Control Presupuestario, Evaluación de Reemplazo y Punto de Equilibrio"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Presupuesto & Finanzas</span>
                  </button>

                  <button
                    id="nav-tab-googlesheets"
                    onClick={() => setActiveScreen('googlesheets')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      activeScreen === 'googlesheets'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
                    }`}
                    title="Ver datos enlazados a Google Sheets tipo hoja de cálculo"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-extrabold">Hoja de Cálculo (Google Sheets)</span>
                    <span className="bg-emerald-500 text-white text-[9px] px-1 py-0.2 rounded font-black tracking-tight uppercase">
                      Sync
                    </span>
                  </button>
                </div>

                {/* Admin Management Actions */}
                <div className="flex flex-wrap items-center gap-1.5 justify-start xl:justify-end w-full xl:w-auto min-w-0">
                  <button
                    id="btn-admin-grabar-todas-nfc"
                    onClick={() => handleOpenNfcWriterForMachine(selectedMachine.code)}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Grabar en NFC cualquiera de las máquinas (M-001 a M-006)"
                  >
                    <Radio className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Grabar NFC (M-001..006)</span>
                  </button>

                  <button
                    id="btn-admin-manual-pdf"
                    onClick={() => setIsUserManualOpen(true)}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Ver y descargar Manual de Uso oficial en PDF"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Manual (PDF)</span>
                  </button>

                  <button
                    id="btn-admin-operadores"
                    onClick={() => {
                      requireAdmin('gestionar operarios y seguridad', () => {
                        setIsOperatorModalOpen(true);
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Gestión de Operarios y Contraseña Maestra"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Operarios</span>
                  </button>

                  <button
                    id="btn-admin-nueva-maquina"
                    onClick={() => {
                      requireAdmin('agregar una nueva máquina', () => {
                        setIsNewMachineModalOpen(true);
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Registrar Nueva Máquina y Parámetros Financieros"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Máquina</span>
                  </button>

                  <button
                    id="btn-admin-reiniciar"
                    onClick={() => {
                      requireAdmin('reiniciar o borrar datos', () => {
                        setIsResetPasswordModalOpen(true);
                      });
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Reiniciar Datos (Protegido por contraseña)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reiniciar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Machine Selector Pills */}
            <div className="px-3 py-2 sm:px-6 bg-white border-t border-slate-100 w-full max-w-full">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 min-w-0 flex-1 scrollbar-thin">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                    Máquinas:
                  </span>
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
                <button
                  id="btn-pills-grabar-nfc"
                  onClick={() => handleOpenNfcWriterForMachine(selectedMachine.code)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-colors self-end sm:self-auto"
                  title="Grabar el Tag NFC de la máquina seleccionada"
                >
                  <Radio className="w-3 h-3 text-blue-600" />
                  <span className="hidden xs:inline">Grabar NFC</span>
                  <span>{selectedMachine.code}</span>
                </button>
              </div>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT FOR ADMIN */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6 min-w-0 overflow-x-hidden">

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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-dashboard-manual-pdf"
                  onClick={() => setIsUserManualOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors shrink-0"
                  title="Abrir y Descargar Manual de Uso oficial en PDF"
                >
                  <BookOpen className="w-4 h-4 text-cyan-200" />
                  <span>📖 Manual de Uso (PDF)</span>
                </button>

                <button
                  id="btn-quick-google-sheets"
                  onClick={() => setActiveScreen('googlesheets')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors shrink-0"
                  title="Abrir vista tipo hoja de cálculo enlazada a Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Hoja de Cálculo (Google Sheets)</span>
                </button>
                <button
                  onClick={() => setIsNfcScannerOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors shrink-0"
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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    Inventario y Estado de Maquinaria de Planta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Resumen consolidado por equipo, estación y parámetros de equilibrio
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                    Total: {machines.length} equipos
                  </span>
                  <button
                    id="btn-table-google-sheets"
                    onClick={() => setActiveScreen('googlesheets')}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                    title="Exportar o sincronizar inventario con Google Sheets"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ver en Google Sheets</span>
                  </button>
                  <button
                    onClick={() => handleOpenNfcWriterForMachine(selectedMachine.code)}
                    className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                    <span>Grabar Tags NFC</span>
                  </button>
                </div>
              </div>

              {/* Informative Banner for Programming 001-006 NFC Tags */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 via-blue-50/70 to-slate-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Radio className="w-4 h-4 text-cyan-200 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-indigo-950 block">
                      Programación de Chips NFC para M-001 a M-006
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Haz clic en "Grabar NFC" en cualquier máquina para programarla con tu teléfono o copiar su URL exacta a NFC Tools.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenNfcWriterForMachine('M-001')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    M-001
                  </button>
                  <button
                    onClick={() => handleOpenNfcWriterForMachine('M-002')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    M-002
                  </button>
                  <button
                    onClick={() => handleOpenNfcWriterForMachine('M-003')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    M-003
                  </button>
                  <button
                    onClick={() => handleOpenNfcWriterForMachine('M-006')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    M-006
                  </button>
                </div>
              </div>

              <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="min-w-[760px] w-full text-left text-xs border-collapse">
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
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPhotoModalMachine(m)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                title={`Cambiar o seleccionar foto para ${m.code}`}
                              >
                                <Camera className="w-3 h-3 text-cyan-600" />
                                <span>Foto</span>
                              </button>
                              <button
                                onClick={() => handleOpenNfcWriterForMachine(m.code)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                title={`Grabar Tag NFC físico para ${m.code}`}
                              >
                                <Radio className="w-3 h-3 text-indigo-600 group-hover:text-white" />
                                <span>Grabar NFC</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMachineId(m.id);
                                  setActiveScreen('terminal');
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                              >
                                Inspeccionar
                              </button>
                            </div>
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

        {/* VIEW C: PUNTO DE EQUILIBRIO & CONTROL PRESUPUESTARIO (Full Financial Module) */}
        {activeScreen === 'financials' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">
                  CONTROL PRESUPUESTARIO & FINANZAS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Presupuesto de Mantenimiento y Evaluación de Reemplazo
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Control de gastos (repuestos, mano de obra y otros), presupuesto asignado y comparación para reemplazo de maquinaria
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
            <FinancialModule
              machine={selectedMachine}
              allMachines={machines}
              onUpdateMachineFinancials={handleUpdateMachineFinancials}
              onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW D: HOJA DE CÁLCULO GOOGLE SHEETS */}
        {activeScreen === 'googlesheets' && (
          <div className="space-y-6 w-full max-w-full min-w-0">
            <GoogleSheetsModule
              machines={machines}
              stations={stations}
              onOpenMachineInTerminal={(mCode) => {
                const found = machines.find((m) => m.code === mCode);
                if (found) {
                  setSelectedMachineId(found.id);
                  setActiveScreen('terminal');
                }
              }}
              showToast={showToast}
            />
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
        initialMachineCode={selectedNfcMachineCode}
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

      {/* Change Machine Photo Modal (Presets, Upload or URL) */}
      {photoModalMachine && (
        <ChangeMachinePhotoModal
          isOpen={true}
          onClose={() => setPhotoModalMachine(null)}
          machine={photoModalMachine}
          onSavePhoto={handleUpdateMachinePhoto}
        />
      )}

      {/* Admin Quick Unlock & Password Modal */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        users={users}
        onSuccess={() => {
          const adminUser = users.find((u) => u.role === 'admin') || {
            id: 'usr-admin-default',
            name: 'Administrador Planta',
            role: 'admin' as const,
            username: 'admin',
            passwordHash: 'admin123',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            createdAt: '2025-01-01',
          };
          setCurrentUser(adminUser);
          localStorage.setItem('tagops_current_user', JSON.stringify(adminUser));
          setActiveScreen('dashboard');
          showToast('Modo Administrador activado.', 'success');
        }}
        actionTitle="Acceso a Panel de Administración"
        actionDescription="Ingrese la contraseña de Administrador (o use Desbloqueo Rápido) para acceder al panel."
      />

      {/* Official Interactive User Manual (Exportable to PDF) */}
      <UserManualModal
        isOpen={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
      />

      {/* Permanent Floating Button to Open Manual from ANY view */}
      <div className="fixed bottom-5 right-5 z-40 print:hidden">
        <button
          id="btn-fab-manual-pdf"
          type="button"
          onClick={() => setIsUserManualOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white cursor-pointer hover:shadow-blue-500/40 transition-all text-xs sm:text-sm animate-pulse hover:animate-none"
          title="Abrir Manual de Uso Oficial y Descargar en PDF"
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 shrink-0" />
          <span>📖 Manual General (PDF)</span>
        </button>
      </div>

    </div>
  );
}
