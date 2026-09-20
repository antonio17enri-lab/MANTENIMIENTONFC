import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Copy, Check, Table, Globe, ExternalLink, ShieldCheck, Rocket } from 'lucide-react';
import { Machine } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, machines }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'mantenimiento' | 'cincoS' | 'dominio'>('dominio');

  if (!isOpen) return null;

  // Generate CSV data for maintenance
  const generateMaintenanceCsv = () => {
    const headers = ['Código', 'Máquina', 'Fecha', 'Tipo', 'Técnico', 'Descripción', 'Costo USD', 'Horas'];
    const rows = machines.flatMap((m) =>
      m.maintenanceHistory.map((item) => [
        m.code,
        `"${m.name}"`,
        item.date,
        item.type,
        `"${item.technician}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        item.cost || 0,
        item.durationHours || 0,
      ])
    );
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  // Generate CSV data for 5S audits
  const generate5SCsv = () => {
    const headers = ['Código', 'Máquina', 'Fecha Auditoría', 'Auditor', 'Cumplimiento General %', 'Clasificación', 'Orden', 'Limpieza', 'Estandarización', 'Disciplina', 'Seguridad'];
    const rows = machines.map((m) => {
      const cats = m.latest5S.categories;
      const getScore = (name: string) => cats.find((c) => c.category === name)?.score || 0;
      return [
        m.code,
        `"${m.name}"`,
        m.latest5S.date,
        `"${m.latest5S.auditor}"`,
        m.latest5S.generalCompliance,
        getScore('Clasificación'),
        getScore('Orden'),
        getScore('Limpieza'),
        getScore('Estandarización'),
        getScore('Disciplina'),
        getScore('Seguridad'),
      ];
    });
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const handleDownloadCsv = () => {
    const csvContent = activeTab === 'mantenimiento' ? generateMaintenanceCsv() : generate5SCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${activeTab}_nfc_planta.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    const csvContent = activeTab === 'mantenimiento' ? generateMaintenanceCsv() : generate5SCsv();
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Almacenamiento y Exportación (Google Sheets / Excel)</h3>
              <p className="text-[11px] text-emerald-100">
                Sincronización de registros capturados por operarios vía NFC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Dataset Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('dominio')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dominio'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Descargar Proyecto & Dominio</span>
            </button>
            <button
              onClick={() => setActiveTab('mantenimiento')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'mantenimiento'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Registros de Mantenimiento
            </button>
            <button
              onClick={() => setActiveTab('cincoS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'cincoS'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Auditorías 5S / 6S
            </button>
          </div>

          {/* TAB 1: DOMAIN & CODE DOWNLOAD */}
          {activeTab === 'dominio' && (
            <div className="space-y-4">
              {/* Direct ZIP Download Box */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Código Fuente Completo (.ZIP)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Listo</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Incluye React 19, TypeScript, Tailwind CSS, todos los componentes, datos y configuraciones listos para ejecutar o subir a tu servidor.
                  </p>
                </div>
                <a
                  href="/proyecto-mantenimiento-nfc.zip"
                  download="proyecto-mantenimiento-nfc.zip"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 text-xs shadow-md shrink-0 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Código ZIP</span>
                </a>
              </div>

              {/* Step by step to deploy with custom domain */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-blue-600" />
                  <span>¿Cómo subirlo a tu propio dominio (ej. mantenimiento.tuempresa.com)?</span>
                </div>

                <div className="space-y-2 text-slate-600 text-[11px]">
                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900 block">Opción más fácil y gratuita (Vercel o Netlify):</strong>
                      <span>
                        Descomprime el ZIP, sube la carpeta a tu cuenta de <strong>GitHub</strong> y conéctala en <strong>Vercel.com</strong> o <strong>Netlify.com</strong>. Detectará Vite automáticamente y se desplegará en 30 segundos.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900 block">Vincular tu dominio propio:</strong>
                      <span>
                        En el panel de Vercel/Netlify ve a <em>Settings → Domains</em>, escribe tu dominio (ej. <code>nfc.tuempresa.com</code>) y agrega el registro DNS tipo CNAME en tu proveedor de dominio (GoDaddy, Cloudflare, etc.).
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900 block">Grabar en los Tags NFC físicos:</strong>
                      <span>
                        Con la app gratuita <strong>NFC Tools</strong> (Android / iOS), selecciona <em>Write → Add a record → URL</em> y escribe tu dominio. ¡Listo! Al tocar el tag con cualquier celular se abrirá la aplicación al instante.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Preview for Mantenimiento and 5S */}
          {activeTab !== 'dominio' && (
            <>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-slate-500" />
                Vista Previa Tabular (Sincronizada con Google Sheets)
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Conexión en Vivo
              </span>
            </div>

            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  {activeTab === 'mantenimiento' ? (
                    <tr>
                      <th className="p-2">Tag</th>
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Técnico</th>
                      <th className="p-2">Trabajo</th>
                      <th className="p-2">Costo</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-2">Tag</th>
                      <th className="p-2">Máquina</th>
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Auditor</th>
                      <th className="p-2">5S %</th>
                      <th className="p-2">Seguridad</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {activeTab === 'mantenimiento'
                    ? machines.flatMap((m) =>
                        m.maintenanceHistory.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-900">{m.code}</td>
                            <td className="p-2">{h.date}</td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  h.type === 'Preventivo'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {h.type}
                              </span>
                            </td>
                            <td className="p-2">{h.technician}</td>
                            <td className="p-2 truncate max-w-xs">{h.description}</td>
                            <td className="p-2 font-mono">${h.cost || 0}</td>
                          </tr>
                        ))
                      )
                    : machines.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold text-slate-900">{m.code}</td>
                          <td className="p-2">{m.name}</td>
                          <td className="p-2">{m.latest5S.date}</td>
                          <td className="p-2">{m.latest5S.auditor}</td>
                          <td className="p-2 font-bold text-emerald-700">
                            {m.latest5S.generalCompliance}%
                          </td>
                          <td className="p-2">
                            {m.latest5S.categories.find((c) => c.category === 'Seguridad')?.score || 90}%
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cloud Integration Details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
            <div className="font-bold text-slate-800">Flujo Google Workspace & Looker Studio:</div>
            <p>
              1. Los envíos desde la terminal móvil NFC se depositan automáticamente en la hoja de cálculo centralizada.
            </p>
            <p>
              2. El conector nativo de Looker Studio refresca cada 15 minutos los gráficos de fallas, cumplimiento y órdenes preventivas.
            </p>
          </div>
          </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {activeTab === 'dominio' ? (
              <a
                href="/proyecto-mantenimiento-nfc.zip"
                download="proyecto-mantenimiento-nfc.zip"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 text-xs shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Código .ZIP (Listo para usar)</span>
              </a>
            ) : (
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar para Google Sheets'}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              {activeTab !== 'dominio' && (
                <button
                  onClick={handleDownloadCsv}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar CSV</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
