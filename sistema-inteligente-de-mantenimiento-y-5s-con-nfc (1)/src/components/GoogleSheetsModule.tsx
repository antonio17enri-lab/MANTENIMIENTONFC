import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  Check,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Sparkles,
  Link2,
  Code2,
  HelpCircle,
  TrendingUp,
  Table,
  CheckCircle2,
  ArrowUpRight,
  X,
  Info,
} from 'lucide-react';
import { Machine, PlantStation, ProductionLog } from '../types';

interface GoogleSheetsModuleProps {
  machines: Machine[];
  stations: PlantStation[];
  onOpenMachineInTerminal?: (machineCode: string) => void;
  showToast?: (text: string, type: 'success' | 'info' | 'warn') => void;
}

type ActiveSheetTab = 'maquinas' | 'produccion' | 'auditorias5s' | 'fallas' | 'formulas_financieras';

export const GoogleSheetsModule: React.FC<GoogleSheetsModuleProps> = ({
  machines,
  stations,
  onOpenMachineInTerminal,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveSheetTab>('maquinas');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('tagops_last_sheet_sync') || new Date().toLocaleTimeString('es-GT');
  });

  // Webhook settings for Google Apps Script
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('tagops_google_sheet_webhook') || '';
  });
  const [isWebhookSettingsOpen, setIsWebhookSettingsOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: string }>({
    row: 1,
    col: 'A',
    val: machines[0]?.code || 'M-001',
  });

  // Consolidate production logs across all machines
  const allProductionLogs = React.useMemo(() => {
    const logs: Array<ProductionLog & { machineCode: string; machineName: string }> = [];
    machines.forEach((m) => {
      if (m.productionHistory && m.productionHistory.length > 0) {
        m.productionHistory.forEach((log) => {
          logs.push({
            ...log,
            machineCode: m.code,
            machineName: m.name,
          });
        });
      } else {
        // Generate current log entry for machine
        logs.push({
          id: `log-${m.id}`,
          date: new Date().toISOString().split('T')[0],
          machineCode: m.code,
          machineName: m.name,
          hoursWorked: m.productionMetrics?.workedHours ?? 135,
          hoursStopped: m.productionMetrics?.stoppedHours ?? 25,
          unitsProduced: m.productionMetrics?.producedUnits ?? 540,
          expectedUnits: m.productionMetrics?.expectedUnits ?? 600,
          operator: m.responsible || 'Operario de Turno',
          stopReason: m.status === 'PARADA_FALLA' ? 'Falla mecánica' : 'Ajuste de lote',
          notes: `Inspección NFC registrada en ${m.location}`,
        });
      }
    });
    return logs;
  }, [machines]);

  // Consolidate failure reports
  const allFailures = React.useMemo(() => {
    const list: Array<{
      id: string;
      machineCode: string;
      date: string;
      type: string;
      severity: string;
      description: string;
      reportedBy: string;
      status: string;
    }> = [];

    machines.forEach((m) => {
      if (m.failures && m.failures.length > 0) {
        m.failures.forEach((f) => {
          list.push({
            id: f.id,
            machineCode: m.code,
            date: f.date,
            type: f.type,
            severity: f.severity,
            description: f.description,
            reportedBy: f.reportedBy,
            status: f.status,
          });
        });
      }
    });
    return list;
  }, [machines]);

  // Generate data rows depending on active tab
  const getSheetData = () => {
    switch (activeTab) {
      case 'maquinas':
        return {
          headers: [
            'Código',
            'Nombre de Máquina',
            'Estación',
            'Estado Operativo',
            'Ubicación',
            'Horas Trabajadas',
            'Horas Paro',
            'Costo Fijo Mensual (Q)',
            'Precio Venta Unitario (Q)',
            'Costo Variable Unitario (Q)',
            'Margen Contribución (Q)',
            'Punto Equilibrio (Unid)',
            'Producción Real (Unid)',
            'Rentabilidad',
            'Cumplimiento 5S (%)',
            'Próxima Revisión',
          ],
          rows: machines.map((m) => {
            const fixed = m.financials?.monthlyFixedCost ?? 15000;
            const price = m.financials?.salePricePerUnit ?? 50;
            const variable = m.financials?.variableCostPerUnit ?? 25;
            const margin = Math.max(1, price - variable);
            const breakEven = Math.round(fixed / margin);
            const produced = m.productionMetrics?.producedUnits ?? 540;
            const isProfit = produced >= breakEven;

            return [
              m.code,
              m.name,
              m.stationId,
              m.status,
              m.location,
              (m.productionMetrics?.workedHours ?? 0).toString(),
              (m.productionMetrics?.stoppedHours ?? 0).toString(),
              fixed.toString(),
              price.toString(),
              variable.toString(),
              margin.toString(),
              breakEven.toString(),
              produced.toString(),
              isProfit ? 'GANANCIA' : 'PÉRDIDA',
              m.latest5S.generalCompliance.toString() + '%',
              m.nextRevisionDate,
            ];
          }),
        };

      case 'produccion':
        return {
          headers: [
            'ID Registro',
            'Fecha',
            'Código Máquina',
            'Nombre Equipo',
            'Operario',
            'Horas Operación',
            'Horas Paro',
            'Unidades Conformes',
            'Meta Estimada',
            'Diferencia (Scrap/Pérdida)',
            'Causa de Paro',
            'Notas de Turno',
          ],
          rows: allProductionLogs.map((log) => [
            log.id,
            log.date,
            log.machineCode,
            log.machineName,
            log.operator,
            log.hoursWorked.toString(),
            log.hoursStopped.toString(),
            log.unitsProduced.toString(),
            (log.expectedUnits ?? log.unitsProduced).toString(),
            ((log.expectedUnits ?? log.unitsProduced) - log.unitsProduced).toString(),
            log.stopReason || 'Sin paros',
            log.notes || 'Operación normal',
          ]),
        };

      case 'auditorias5s':
        return {
          headers: [
            'Código Máquina',
            'Nombre',
            'Auditor / Operario',
            'Fecha Auditoría',
            '1S - Clasificar (Seiri)',
            '2S - Ordenar (Seiton)',
            '3S - Limpiar (Seiso)',
            '4S - Estandarizar (Seiketsu)',
            '5S - Disciplina (Shitsuke)',
            '% Cumplimiento Global',
            'Observaciones',
          ],
          rows: machines.map((m) => {
            const audit = m.latest5S;
            const catScores: Record<string, number> = {};
            audit.categories.forEach((cat) => {
              catScores[cat.category] = cat.score;
            });

            return [
              m.code,
              m.name,
              audit.auditor,
              audit.date,
              (catScores['Clasificación'] ?? 80).toString() + '%',
              (catScores['Orden'] ?? 85).toString() + '%',
              (catScores['Limpieza'] ?? 90).toString() + '%',
              (catScores['Estandarización'] ?? 80).toString() + '%',
              (catScores['Disciplina'] ?? 85).toString() + '%',
              audit.generalCompliance.toString() + '%',
              audit.observations || 'Auditoría en orden.',
            ];
          }),
        };

      case 'fallas':
        return {
          headers: [
            'Folio Incidencia',
            'Máquina',
            'Fecha Detección',
            'Tipo de Falla',
            'Severidad',
            'Reportado Por',
            'Estado',
            'Descripción Técnica',
          ],
          rows: allFailures.map((f) => [
            f.id,
            f.machineCode,
            f.date,
            f.type,
            f.severity,
            f.reportedBy,
            f.status,
            f.description,
          ]),
        };

      case 'formulas_financieras':
        return {
          headers: [
            'Celda',
            'Concepto Financiero',
            'Fórmula en Google Sheets',
            'Parámetros Actuales (Q)',
            'Resultado Calculado',
            'Explicación de Negocio',
          ],
          rows: [
            [
              'B2',
              'Margen de Contribución Unitario',
              '=C2-D2',
              'Precio Q50.00 - Costo Var Q25.00',
              'Q25.00',
              'Cada unidad vendida deja Q25 para cubrir costos fijos.',
            ],
            [
              'B3',
              'Punto de Equilibrio (Unidades)',
              '=E2/F2',
              'Costos Fijos Q15,000 / Margen Q25',
              '600 Unidades',
              'Se deben producir 600 unidades para no tener pérdidas.',
            ],
            [
              'B4',
              'Ventas de Equilibrio en Quetzales',
              '=B3*C2',
              '600 Unid * Q50.00',
              'Q30,000.00',
              'Ingreso mínimo mensual requerido para estar en equilibrio.',
            ],
            [
              'B5',
              'Costo de Oportunidad por Paro',
              '=H2*(G2-I2)',
              'Margen Q25 * 60 Unidades perdidas',
              'Q1,500.00',
              'Dinero directo que no ingresó a la empresa por tiempos muertos.',
            ],
            [
              'B6',
              'Flujo Neto Operativo de Planta',
              '=SUM(Ingresos)-SUM(Egresos)',
              'Q45,000 - Q34,000',
              '+Q11,000.00',
              'Superávit de caja disponible para reinversión o reservas.',
            ],
          ],
        };
    }
  };

  const currentSheet = getSheetData();

  // Filter rows by search term
  const filteredRows = currentSheet.rows.filter((row) =>
    row.some((cell) => cell.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Copy as TSV (Tab-Separated Values) so it pastes into Google Sheets cells directly
  const handleCopyForGoogleSheets = () => {
    const tsvContent = [
      currentSheet.headers.join('\t'),
      ...currentSheet.rows.map((r) => r.join('\t')),
    ].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedSuccess(true);
      if (showToast) {
        showToast('¡Datos copiados! Abre Google Sheets y presiona Ctrl+V en cualquier celda.', 'success');
      }
      setTimeout(() => setCopiedSuccess(false), 3000);
    });
  };

  // Download UTF-8 CSV
  const handleDownloadCsv = () => {
    const csvRows = [
      currentSheet.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...currentSheet.rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ];
    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TAG_OPS_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast('Archivo CSV descargado. Puedes arrastrarlo directamente a Google Drive o Excel.', 'success');
    }
  };

  // Open Google Sheets, copy all formatted data to clipboard, and trigger step-by-step assistant
  const handleOpenGoogleSheetsWithData = () => {
    const tsvContent = [
      currentSheet.headers.join('\t'),
      ...currentSheet.rows.map((r) => r.join('\t')),
    ].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedSuccess(true);
      window.open('https://sheets.new', '_blank');
      setShowGuideModal(true);
      if (showToast) {
        showToast(
          '¡Hoja abierta! Presiona Ctrl + V en la celda A1 para reflejar todos los datos automáticamente.',
          'success'
        );
      }
      setTimeout(() => setCopiedSuccess(false), 3500);
    });
  };

  // Sync with Google Sheets Webhook
  const handleSyncToGoogleSheets = async () => {
    setIsSyncing(true);

    // Save webhook if set
    if (webhookUrl) {
      localStorage.setItem('tagops_google_sheet_webhook', webhookUrl);
    }

    try {
      if (webhookUrl.trim().startsWith('http')) {
        // Send payload to real Google Apps Script Webhook
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // standard for Google Apps Script Web Apps
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            sheet: activeTab,
            headers: currentSheet.headers,
            rows: currentSheet.rows,
            summary: {
              totalMachines: machines.length,
              totalLogs: allProductionLogs.length,
            },
          }),
        });
      }

      const now = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(now);
      localStorage.setItem('tagops_last_sheet_sync', now);

      if (showToast) {
        showToast(
          webhookUrl.trim()
            ? `¡Sincronización enviada con éxito a Google Sheets a las ${now}!`
            : `¡Datos actualizados y listos para Google Sheets a las ${now}!`,
          'success'
        );
      }
    } catch (err) {
      if (showToast) {
        showToast('Error al conectar con el Webhook. Revisa la URL ingresada.', 'warn');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Sheets Apps Script Template Snippet
  const appsScriptCode = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(data.sheet) || ss.insertSheet(data.sheet);
  
  // Si la hoja está vacía, agregar encabezados
  if (sheet.getLastRow() === 0 && data.headers) {
    sheet.appendRow(data.headers);
  }
  
  // Agregar cada fila de datos recibida desde TAG OPS
  if (data.rows && data.rows.length > 0) {
    data.rows.forEach(function(row) {
      sheet.appendRow(row);
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  return (
    <div className="w-full max-w-full space-y-4 min-w-0">
      {/* Top Google Sheets Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 w-full max-w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
                TAG_OPS_Planta_Industrial_2026.gsheet
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Google Sheets Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {lastSyncTime
                ? `Última sincronización: ${lastSyncTime} • ${machines.length} máquinas enlazadas`
                : 'Enlace en tiempo real con hoja de cálculo'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-start md:justify-end shrink-0">
          <button
            onClick={handleCopyForGoogleSheets}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Copiar todas las celdas en formato Google Sheets (pegar con Ctrl+V)"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar para Sheets</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Descargar archivo CSV compatible con Google Drive y Microsoft Excel"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden xs:inline">Descargar CSV</span>
          </button>

          <button
            onClick={handleOpenGoogleSheetsWithData}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Abrir Google Sheets y copiar datos para reflejarlos automáticamente"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
            <span>Abrir Google Sheets con Datos</span>
          </button>

          <button
            onClick={() => setIsWebhookSettingsOpen(!isWebhookSettingsOpen)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isWebhookSettingsOpen || webhookUrl
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Configurar enlace directo a través de Google Apps Script"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Enlace Webhook</span>
          </button>

          <button
            onClick={handleSyncToGoogleSheets}
            disabled={isSyncing}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Forzar actualización de datos hacia la hoja de cálculo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>
      </div>

      {/* Webhook & Google Sheets Automation Configuration Accordion */}
      {isWebhookSettingsOpen && (
        <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Conexión Automática en la Nube con tu Google Sheet
              </h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Paso a Paso
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Puedes conectar esta aplicación directamente a cualquier Google Sheet tuya sin instalar nada adicional.
            Cada vez que un operario escanea un tag NFC o se registra una producción, los datos se enviarán a tu hoja.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                1. Pega aquí la URL de tu Web App / Webhook de Google Sheets:
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 block">
                Se guarda en tu navegador y se ejecuta cada vez que presionas "Sincronizar".
              </span>
            </div>

            <div className="bg-slate-900 text-slate-100 p-3 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-800 pb-1">
                <span>2. Código para Google Apps Script (Extensiones &gt; Apps Script)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appsScriptCode);
                    if (showToast) showToast('Código de Apps Script copiado al portapapeles', 'info');
                  }}
                  className="text-cyan-300 hover:text-cyan-200 cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copiar código
                </button>
              </div>
              <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-24 p-1">
                {appsScriptCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet Tabs Selector (Google Sheets Style) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-1.5 rounded-t-2xl shadow-2xs scrollbar-none w-full max-w-full">
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={() => setActiveTab('maquinas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'maquinas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>1. Maquinaria_Finanzas ({machines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('produccion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'produccion'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Bitacora_NFC ({allProductionLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('auditorias5s')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'auditorias5s'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Auditorias_5S ({machines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fallas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'fallas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Fallas_Reportadas ({allFailures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas_financieras')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'formulas_financieras'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>5. Fórmulas_GoogleSheets</span>
          </button>
        </div>

        {/* Quick Search inside Active Sheet */}
        <div className="relative shrink-0 max-w-[180px] sm:max-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar en hoja..."
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Formula Bar & Active Cell Display (Google Sheets Style) */}
      <div className="bg-slate-100/90 border-x border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-700">
        <div className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800 text-[11px] shrink-0 min-w-[36px] text-center shadow-2xs">
          {selectedCell.col}{selectedCell.row}
        </div>
        <div className="text-slate-400 font-bold shrink-0">fx</div>
        <div className="bg-white border border-slate-200 rounded px-2.5 py-0.5 flex-1 truncate text-slate-900 text-xs">
          {selectedCell.val}
        </div>
        <span className="text-[10px] text-slate-400 shrink-0 font-sans hidden sm:inline">
          {filteredRows.length} filas cargadas
        </span>
      </div>

      {/* The Spreadsheet Grid Table (Responsive, contained, no overflow outside margin) */}
      <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-full">
        <div className="w-full max-w-full overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse font-sans min-w-[720px]">
            <thead>
              {/* Google Sheets Alphabetical Column Headers (A, B, C, D...) */}
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 text-[10px] font-mono select-none">
                <th className="py-1 px-2 border-r border-slate-200 w-10 text-center font-semibold bg-slate-200/50">
                  #
                </th>
                {currentSheet.headers.map((_, idx) => {
                  const letter = String.fromCharCode(65 + (idx % 26));
                  return (
                    <th key={idx} className="py-1 px-3 border-r border-slate-200 text-center font-bold">
                      {letter}
                    </th>
                  );
                })}
              </tr>

              {/* Functional Column Names */}
              <tr className="bg-slate-50 border-b-2 border-slate-300 text-slate-700 font-bold">
                <th className="py-2.5 px-2 border-r border-slate-200 text-center text-slate-400 bg-slate-100 font-mono text-[10px]">
                  1
                </th>
                {currentSheet.headers.map((header, colIdx) => (
                  <th
                    key={colIdx}
                    className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap tracking-tight text-slate-800"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row, rowIdx) => {
                const rowNumber = rowIdx + 2; // Row 1 is header
                return (
                  <tr
                    key={rowIdx}
                    className="hover:bg-blue-50/50 transition-colors group cursor-cell"
                  >
                    {/* Row Index Number in Google Sheets */}
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400 bg-slate-50/50 select-none group-hover:bg-blue-100/40">
                      {rowNumber}
                    </td>

                    {/* Data Cells */}
                    {row.map((cell, colIdx) => {
                      const colLetter = String.fromCharCode(65 + (colIdx % 26));
                      const isSelected = selectedCell.row === rowNumber && selectedCell.col === colLetter;
                      const isCode = colIdx === 0 && cell.startsWith('M-');
                      const isFinancialNumber = cell.startsWith('Q') || (colIdx >= 7 && colIdx <= 12 && !isNaN(Number(cell)));

                      return (
                        <td
                          key={colIdx}
                          onClick={() => {
                            setSelectedCell({
                              row: rowNumber,
                              col: colLetter,
                              val: cell,
                            });
                          }}
                          className={`py-2 px-3 border-r border-slate-100 text-slate-700 whitespace-nowrap transition-all ${
                            isSelected
                              ? 'bg-blue-100/60 ring-2 ring-blue-500 ring-inset font-bold text-blue-950'
                              : ''
                          } ${isCode ? 'font-mono font-bold text-blue-700' : ''} ${
                            isFinancialNumber ? 'font-mono text-slate-900' : ''
                          }`}
                        >
                          {cell === 'OPERATIVA' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              OPERATIVA
                            </span>
                          ) : cell === 'PARADA_FALLA' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              PARADA / FALLA
                            </span>
                          ) : cell === 'EN_REVISION' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              EN REVISIÓN
                            </span>
                          ) : cell === 'GANANCIA' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Zona Ganancia
                            </span>
                          ) : cell === 'PÉRDIDA' ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Zona Pérdida
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={currentSheet.headers.length + 1}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    No se encontraron registros que coincidan con "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary in Google Sheets */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Mostrando <strong>{filteredRows.length}</strong> registros
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>
              Columnas activas: <strong>{currentSheet.headers.length}</strong>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-emerald-700 font-medium">
              ✓ Compatible 100% con Google Drive, Sheets y Excel
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyForGoogleSheets}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar para pegar en tu Google Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL GUÍA: PASO A PASO PARA REFLEJAR DATOS EN GOOGLE SHEETS */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    ¡Tus datos están listos en Google Sheets!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paso a paso para ver tus {currentSheet.rows.length} registros reflejados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
              <div className="text-xs font-black text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Datos copiados al portapapeles con éxito</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                En la nueva pestaña de Google Sheets que se acaba de abrir en tu navegador:
              </p>
              <ol className="text-xs text-emerald-900 space-y-2 font-medium pl-4 list-decimal">
                <li>
                  Haz clic en la celda <strong>A1</strong> (la primera celda superior izquierda).
                </li>
                <li>
                  Presiona el atajo <strong>Ctrl + V</strong> (o clic derecho &gt; <em>Pegar</em>).
                </li>
                <li>
                  ¡Listo! Las <strong>{currentSheet.headers.length} columnas</strong> y los datos de las máquinas se pegarán automáticamente con su formato correspondiente.
                </li>
              </ol>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Otras opciones automáticas:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyForGoogleSheets}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Volver a Copiar</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Descargar como CSV</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
                  setIsWebhookSettingsOpen(true);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Configurar Webhook en vivo</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Entendido, ir a Google Sheets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
