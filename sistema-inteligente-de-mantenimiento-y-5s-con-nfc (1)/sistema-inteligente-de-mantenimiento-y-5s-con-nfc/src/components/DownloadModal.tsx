import React, { useState } from 'react';
import { X, Download, ExternalLink, AlertCircle, CheckCircle, Code, Copy, Check } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [inIframe, setInIframe] = useState(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  });

  if (!isOpen) return null;

  const directZipUrl = `${window.location.origin}/proyecto-mantenimiento-nfc.zip`;

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const response = await fetch('/proyecto-mantenimiento-nfc.zip');
      if (!response.ok) throw new Error('Error al obtener el archivo');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proyecto-mantenimiento-nfc.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Download failed, opening direct link:', err);
      // Fallback: direct window location
      window.open('/proyecto-mantenimiento-nfc.zip', '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(directZipUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Descargar Código Fuente (.ZIP)</h3>
              <p className="text-[11px] text-slate-400">
                Todo el proyecto React + TypeScript listo para desplegar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          
          {/* Iframe warning if applicable */}
          {inIframe && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Aviso de seguridad del navegador:</span>
                <span>
                  Estás dentro del marco de previsualización (iframe). Muchos navegadores bloquean descargas automáticas dentro de marcos. Si al pulsar el botón no inicia la descarga, pulsa el botón <strong>"Abrir en pestaña nueva"</strong> abajo.
                </span>
              </div>
            </div>
          )}

          {/* Main Download Action */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">Archivo del proyecto</div>
                <div className="text-slate-500 text-[11px]">proyecto-mantenimiento-nfc.zip (~76 KB)</div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Completo
              </span>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer text-xs"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generando descarga...' : 'Iniciar Descarga Directa'}</span>
            </button>

            {downloadSuccess && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium flex items-center gap-1.5 justify-center text-[11px]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>¡Descarga enviada a tu navegador! Revisa tu carpeta de Descargas.</span>
              </div>
            )}
          </div>

          {/* Solution if blocked: Open in new tab */}
          <div className="space-y-2">
            <div className="font-bold text-slate-700">Si tu navegador no inició la descarga:</div>
            
            <button
              onClick={handleOpenNewTab}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Abrir App en Pestaña Nueva (Sin restricciones)</span>
            </button>

            {/* Direct Link */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-xl border border-slate-200 text-[10px]">
              <span className="text-slate-500 font-mono truncate flex-1">{directZipUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copiado' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>

          {/* Instructions for custom domain */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-950 space-y-1">
            <span className="font-bold block text-blue-900">¿Cómo usarlo con tu dominio propio?</span>
            <p>1. Descomprime el archivo ZIP en tu computadora.</p>
            <p>2. Sube los archivos a GitHub y conéctalo en <strong>Vercel</strong> o <strong>Netlify</strong> (es gratis).</p>
            <p>3. En los ajustes de Vercel/Netlify ve a <em>Domains</em> y escribe tu dominio para que quede online.</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
