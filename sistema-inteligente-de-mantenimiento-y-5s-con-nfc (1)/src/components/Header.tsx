import React from 'react';
import { Radio, Smartphone, BarChart3, QrCode, Download, RefreshCw, FileSpreadsheet, BookOpen } from 'lucide-react';
import { Machine } from '../types';

interface HeaderProps {
  currentView: 'full' | 'mobile' | 'dashboard' | 'tags';
  setCurrentView: (view: 'full' | 'mobile' | 'dashboard' | 'tags') => void;
  selectedMachine: Machine;
  onSelectMachine: (machineId: string) => void;
  machines: Machine[];
  onOpenNfcScanner: () => void;
  onOpenExportModal: () => void;
  onResetDemoData: () => void;
  onOpenDownloadModal: () => void;
  onOpenUserManual?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  selectedMachine,
  onSelectMachine,
  machines,
  onOpenNfcScanner,
  onOpenExportModal,
  onResetDemoData,
  onOpenDownloadModal,
  onOpenUserManual,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                SISTEMA INTELIGENTE DE MANTENIMIENTO Y 5S CON NFC
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                En línea
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Información inmediata • Registros digitales • Mejora continua
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* NFC Tap Action */}
          <button
            id="btn-scan-nfc"
            onClick={onOpenNfcScanner}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>Escanear / Simular NFC</span>
          </button>

          {/* Quick machine selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600 pl-1.5 hidden sm:inline">Máquina:</span>
            <select
              id="select-machine"
              value={selectedMachine.id}
              onChange={(e) => onSelectMachine(e.target.value)}
              className="bg-white text-slate-800 font-bold px-2.5 py-1 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} ({m.status === 'OPERATIVA' ? '🟢 Operativa' : m.status === 'EN_REVISION' ? '🟡 En revisión' : '🔴 Falla'})
                </option>
              ))}
            </select>
          </div>

          {/* Manual PDF button */}
          {onOpenUserManual && (
            <button
              id="btn-header-manual-pdf"
              onClick={onOpenUserManual}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Consultar y descargar Manual de Uso oficial en PDF"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-200" />
              <span>Manual (PDF)</span>
            </button>
          )}

          {/* Download Project ZIP button */}
          <button
            id="btn-download-zip"
            onClick={onOpenDownloadModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Descargar el código completo del proyecto en archivo .ZIP"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Descargar ZIP</span>
          </button>

          {/* Export button */}
          <button
            id="btn-export-data"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Exportar registros a Google Sheets / Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exportar / Dominio</span>
          </button>

          {/* Reset Demo Data */}
          <button
            id="btn-reset-demo"
            onClick={onResetDemoData}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Restablecer datos de demostración"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-200 bg-slate-50/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1">
          <nav className="flex space-x-1 sm:space-x-2 text-xs font-semibold" aria-label="Tabs">
            <button
              id="tab-view-full"
              onClick={() => setCurrentView('full')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'full'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Vista Integral (Celular + Dashboard)</span>
            </button>

            <button
              id="tab-view-mobile"
              onClick={() => setCurrentView('mobile')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Terminal Móvil NFC (Operario)</span>
            </button>

            <button
              id="tab-view-dashboard"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard de Indicadores & KPIs</span>
            </button>

            <button
              id="tab-view-tags"
              onClick={() => setCurrentView('tags')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'tags'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Etiquetas Físicas NFC/QR</span>
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Tag activo: <strong className="text-slate-800">{selectedMachine.code}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>Estación: <strong className="text-slate-800">{selectedMachine.stationId}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
