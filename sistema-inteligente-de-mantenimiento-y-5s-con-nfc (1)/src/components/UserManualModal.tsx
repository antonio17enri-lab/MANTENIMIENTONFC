import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  BookOpen,
  Radio,
  Smartphone,
  Shield,
  Activity,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  Wrench,
  DollarSign,
  Download,
  Flame,
  Search,
} from 'lucide-react';
import { TagOpsLogo } from './TagOpsLogo';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'cap1' | 'cap2' | 'cap3' | 'cap4' | 'cap5' | 'cap6' | 'cap7'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = document.getElementById('manual-content-to-copy')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Dialog */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Top Header Bar (Hidden during Print) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  MANUAL TÉCNICO Y DE OPERACIÓN GENERAL
                </h2>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">
                  TagOps 4.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documento Maestro de Planta • Para Operarios, Mantenimiento y Supervisión
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar el texto completo del manual al portapapeles"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Copiar texto</span>
                </>
              )}
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:shadow-blue-500/25"
              title="Guardar como archivo PDF o imprimir en papel"
            >
              <Printer className="w-4 h-4 text-cyan-200" />
              <span>Guardar como PDF / Imprimir</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chapters Navigation Tabs (Hidden during Print) */}
        <div className="px-4 sm:px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto print:hidden shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Capítulo:
          </span>
          {[
            { id: 'all', label: 'Todo el Manual' },
            { id: 'cap1', label: 'Cap. 1: Arquitectura & NFC' },
            { id: 'cap2', label: 'Cap. 2: Seguridad & Roles' },
            { id: 'cap3', label: 'Cap. 3: Operación en Piso' },
            { id: 'cap4', label: 'Cap. 4: Supervisor & OEE' },
            { id: 'cap5', label: 'Cap. 5: Grabación NFC' },
            { id: 'cap6', label: 'Cap. 6: Nube & Respaldos' },
            { id: 'cap7', label: 'Cap. 7: Preguntas & FAQ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Document Content */}
        <div
          id="manual-content-to-copy"
          className="p-6 sm:p-10 overflow-y-auto flex-1 font-sans text-slate-800 space-y-8 bg-white print:p-4 print:overflow-visible"
        >
          {/* Cover Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TagOpsLogo size="md" showSubtitle={false} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                MANUAL GENERAL DE OPERACIÓN Y SISTEMA — TAGOPS 4.0
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Plataforma Integral de Mantenimiento Autónomo, Control de Paradas en Tiempo Real, OEE y Tags NFC
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right text-xs space-y-1 shrink-0">
              <div>
                <span className="font-bold text-slate-500">Documento:</span>{' '}
                <span className="font-mono font-bold text-slate-900">MN-TAGOPS-4.0-MASTER</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Versión:</span>{' '}
                <span className="font-bold text-blue-600">4.0 (Industrial Full Release)</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Alcance:</span>{' '}
                <span className="font-bold text-slate-700">Toda la Planta Industrial</span>
              </div>
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Resumen Ejecutivo del Sistema
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>TagOps</strong> digitaliza el 100% de la gestión de piso en plantas manufactureras. Al aproximar un smartphone a las etiquetas NFC instaladas en cada máquina, el operario accede al semáforo de estado, reporte de fallas mecánicas con fotos, registro de producción conforme y scrap, auditorías 5S y firma digital de órdenes de trabajo. La gerencia y supervisión obtienen el cálculo automático de OEE, punto de equilibrio y exportación de datos tipo Excel.
            </p>
          </div>

          {/* ======================================================== */}
          {/* CAPÍTULO 1 */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'cap1') && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-blue-600">
                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-black text-xs">
                  CAPÍTULO 1
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  ARQUITECTURA GENERAL Y FUNDAMENTOS DE LA TECNOLOGÍA NFC
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                <p>
                  <strong>1.1. Principio de Funcionamiento NFC (Near Field Communication):</strong> Los chips NFC utilizados son componentes pasivos que no requieren baterías, cables ni recargas de energía. Al acercar un teléfono móvil con lector NFC (distancia de 1 a 3 cm), la antena del smartphone emite una señal de inducción electromagnética a 13.56 MHz que activa el chip en milisegundos y lee la URL codificada en formato estándar NDEF.
                </p>

                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Regla de Oro de Hardware: Uso de Etiquetas Anti-Metal (Ferrita)
                  </div>
                  <p className="text-xs text-slate-700">
                    Las máquinas industriales están construidas de placas de acero, fierro o aluminio. Si se pega una etiqueta NFC estándar de papel o plástico directamente sobre la chapa metálica, las corrientes de Foucault (Eddy currents) reflejan el campo magnético y bloquean la lectura por completo. Es <strong>estrictamente obligatorio</strong> utilizar etiquetas tipo <strong>Anti-Metal (On-Metal)</strong>, las cuales cuentan con una capa trasera de ferrita que aísla la antena del chasis metálico.
                  </p>
                </div>

                <p>
                  <strong>1.2. Especificaciones de Chips Recomendados:</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 text-xs block mb-1">NXP NTAG213</span>
                    <span className="text-[11px] text-slate-600 block">Capacidad: 144 bytes de memoria útil. Es el más económico y perfecto para almacenar la URL directa de la máquina.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 text-xs block mb-1">NXP NTAG215</span>
                    <span className="text-[11px] text-slate-600 block">Capacidad: 504 bytes. Excelente alcance de lectura y mayor durabilidad en ambientes industriales.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 text-xs block mb-1">NXP NTAG216</span>
                    <span className="text-[11px] text-slate-600 block">Capacidad: 888 bytes. Permite almacenar datos de texto adicionales, claves y URLs largas.</span>
                  </div>
                </div>

                <p>
                  <strong>1.3. Modelo Web PWA (Progressive Web App):</strong> No requiere instalaciones lentas desde tiendas de aplicaciones. Se abre directamente en Google Chrome o Safari. Puede instalarse como icono de aplicación en el escritorio del teléfono seleccionando <em>"Agregar a la pantalla principal"</em> en el menú del navegador.
                </p>
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* CAPÍTULO 2 */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'cap2') && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-indigo-600">
                <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-black text-xs">
                  CAPÍTULO 2
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  CONTROL DE ACCESO, SEGURIDAD Y GESTIÓN DE ROLES
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                <p>
                  Para garantizar la trazabilidad de cada registro en planta, el sistema cuenta con autenticación por credenciales individuales y un esquema de permisos por rol:
                </p>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Rol</th>
                        <th className="p-3">Perfil de Usuario</th>
                        <th className="p-3">Acciones Permitidas en el Sistema</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600">
                      <tr>
                        <td className="p-3 font-bold text-blue-600">Operador</td>
                        <td className="p-3">Personal en máquina (ej. Juan Pérez)</td>
                        <td className="p-3">Cambiar semáforo de máquina, registrar piezas buenas y scrap, reportar averías y realizar auditoría 5S.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-600">Técnico Mant.</td>
                        <td className="p-3">Técnicos mecánicos y eléctricos</td>
                        <td className="p-3">Registrar órdenes de trabajo de mantenimiento preventivo y correctivo, registrar piezas cambiadas y firmar en pantalla.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-indigo-600">Supervisor</td>
                        <td className="p-3">Jefe de turno / Línea</td>
                        <td className="p-3">Acceso a tablero de OEE en vivo, visualización de métricas de paradas y exportación de reportes.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-purple-600">Administrador</td>
                        <td className="p-3">Gerencia / Ingeniería de Planta</td>
                        <td className="p-3">Control total: Alta y baja de máquinas, grabación de tags NFC, gestión de operarios y contraseñas maestras.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  <strong>2.2. Desbloqueo y Contraseña Maestra de Seguridad:</strong> Las funciones sensibles (dar de alta una máquina, resetear datos o crear usuarios) están blindadas mediante un modal de confirmación con contraseña maestra administrativa para prevenir modificaciones no autorizadas en el piso de fábrica.
                </p>
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* CAPÍTULO 3 */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'cap3') && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-emerald-600">
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-black text-xs">
                  CAPÍTULO 3
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  TERMINAL DE PISO: GUÍA PASO A PASO PARA EL OPERARIO
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-blue-800 uppercase">
                    <Radio className="w-4 h-4 text-blue-600" />
                    3.1. Identificación y Enlace de Máquina
                  </div>
                  <p className="text-xs text-slate-600">
                    • <strong>Método Principal (NFC):</strong> Aproxime la parte superior o trasera de su teléfono a la etiqueta física adherida a la máquina. El teléfono vibrará y cargará automáticamente la máquina correspondiente.<br />
                    • <strong>Método Manual:</strong> Si el operario no cuenta con lector NFC en su teléfono, utilice el selector desplegable en la barra superior para elegir la máquina por su nombre o código (ej. <em>M-001 Inyectora Engel 150T</em>).
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-emerald-800 uppercase">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    3.2. Control de Estados (Semáforo de Operación)
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    En la pantalla principal, el operario cuenta con los tres botones de estado con retroalimentación instantánea:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-xs font-bold text-emerald-900 block mb-0.5">🟢 Operando</span>
                      <span className="text-[11px] text-slate-600">Máquina en régimen normal de producción. Suma al tiempo disponible de OEE.</span>
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-xs font-bold text-amber-900 block mb-0.5">🟡 En Revisión</span>
                      <span className="text-[11px] text-slate-600">Ajuste de parámetros, cambio de molde, purga o limpieza de boquillas.</span>
                    </div>
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                      <span className="text-xs font-bold text-rose-900 block mb-0.5">🔴 Detenida / Falla</span>
                      <span className="text-[11px] text-slate-600">Parada imprevista por avería mecánica, falla eléctrica o desabastecimiento.</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-indigo-800 uppercase">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    3.3. Registro de Producción y Scrap
                  </div>
                  <p className="text-xs text-slate-600">
                    1. Presione el botón <strong>"Registrar Producción"</strong>.<br />
                    2. Ingrese el número de <strong>Piezas Buenas Conformes</strong> y piezas con defecto (<strong>Scrap</strong>).<br />
                    3. Si hay scrap, seleccione el motivo de descarte (rebaba, poro, deformación, calibración).<br />
                    4. Presione <strong>"Guardar"</strong>. El rendimiento de la máquina y la merma se recalculan en tiempo real.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-rose-800 uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    3.4. Reporte de Averías con Evidencia Fotográfica
                  </div>
                  <p className="text-xs text-slate-600">
                    Al presentarse una falla, presione <strong>"Reportar Falla"</strong>. Seleccione la severidad (Leve, Media, Crítica), el subsistema afectado (Mecánico, Eléctrico, Hidráulico, Neumático) y active la cámara para tomar una fotografía de la avería. Esto genera un ticket con hora exacta para el equipo de mantenimiento.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-teal-800 uppercase">
                    <CheckSquare className="w-4 h-4 text-teal-600" />
                    3.5. Auditoría 5S de Turno y Firma en Pantalla
                  </div>
                  <p className="text-xs text-slate-600">
                    Presione <strong>"Auditoría 5S"</strong> en la barra inferior. Evalúe los 5 puntos clave (Clasificar, Ordenar, Limpiar, Estandarizar, Disciplina). Al terminar, firme con el dedo en la pantalla táctil para registrar la auditoría con fecha y nombre del operario.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* CAPÍTULO 4 */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'cap4') && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-amber-500">
                <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-black text-xs">
                  CAPÍTULO 4
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  PANEL DEL SUPERVISOR, OEE, MÓDULO FINANCIERO Y HOJA DE CÁLCULO
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                <p>
                  <strong>4.1. Algoritmo y Fórmulas Matemáticas de OEE (Overall Equipment Effectiveness):</strong>
                </p>

                <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs space-y-2 text-slate-800">
                  <div className="font-bold text-blue-700">FÓRMULA GLOBAL: OEE = Disponibilidad × Rendimiento × Calidad</div>
                  <div>• <strong>Disponibilidad (A):</strong> (Tiempo Real Operando / Tiempo Planificado de Turno) × 100%</div>
                  <div>• <strong>Rendimiento (P):</strong> (Piezas Reales Producidas / Capacidad Teórica del Equipo) × 100%</div>
                  <div>• <strong>Calidad (Q):</strong> (Piezas Conformes Aprobadas / Total de Piezas Fabricadas) × 100%</div>
                </div>

                <p>
                  <strong>4.2. Módulo de Impacto Financiero y Punto de Equilibrio:</strong>
                  <br />
                  Convierte el tiempo de parada de máquina en pérdidas monetarias directas ($ USD / Pesos). Multiplica el tiempo de inactividad no planificado por el costo hora de paro configurado en la máquina, permitiendo presentar a gerencia el costo financiero exacto de cada falla mecánica o retraso de set-up.
                </p>

                <p>
                  <strong>4.3. Módulo de Hoja de Cálculo (Cuadrícula Tipo Excel):</strong>
                  <br />
                  Permite auditar el historial de planta con pestañas de filtrado: <em>Eventos de Estado</em>, <em>Registro de Producción</em>, <em>Tickets de Falla</em> y <em>Auditorías 5S</em>. Cuenta con botones de exportación a CSV/Excel y sincronización con Google Sheets para alimentar tableros de PowerBI o Google Looker Studio.
                </p>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                    4.4. Módulo de Control Presupuestario y Evaluación Financiera de Reemplazo (Nuevo)
                  </span>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    Permite definir un presupuesto de mantenimiento por máquina y registrar el desglose de cada intervención: <strong>Repuestos</strong>, <strong>Mano de Obra</strong> y <strong>Otros Gastos</strong>.
                  </p>
                  <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                    <li><strong>Cálculo Automático:</strong> Calcula en tiempo real el total gastado, el saldo presupuestario disponible y la variación o sobregiro.</li>
                    <li><strong>Comparación vs Máquina Nueva:</strong> Contrasta los costos acumulados de mantenimiento con el valor estimado de adquisición de un equipo nuevo.</li>
                    <li><strong>Alerta Preventiva de Reemplazo:</strong> Dispara recomendaciones financieras automáticas cuando los gastos alcanzan el 70% o superan el 100% del valor de un reemplazo nuevo, orientando decisiones estratégicas de inversión (CAPEX vs OPEX).</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* CAPÍTULO 5 */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'cap5') && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-purple-600">
                <span className="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-black text-xs">
                  CAPÍTULO 5
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  PROGRAMACIÓN Y GRABACIÓN DE TAGS FÍSICOS NFC
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                <p>
                  El sistema genera una dirección web unívoca por máquina que debe ser grabada en el chip NFC adhesivo. Se dispone de dos procedimientos de grabación:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                      Método 1 • Grabación Directa (Chrome en Android)
                    </span>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                      <li>Inicie sesión como Administrador en su teléfono.</li>
                      <li>Toque el botón <strong>"Grabar NFC Físico"</strong> en la máquina deseada.</li>
                      <li>Toque <strong>"Escribir Tag con Web NFC"</strong> y acepte los permisos del navegador.</li>
                      <li>Aproxime la etiqueta virgen al teléfono hasta que aparezca la confirmación en verde.</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                      Método 2 • Con Aplicación Gratuita "NFC Tools"
                    </span>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                      <li>Descargue <strong>NFC Tools</strong> (disponible gratis en Google Play y App Store).</li>
                      <li>En TagOps copie la URL (ejemplo: <code>https://tu-planta.app?maquina=M-001</code>).</li>
                      <li>En NFC Tools seleccione: <em>Escribir → Agregar un registro → URL/URI</em>.</li>
                      <li>Pegue el enlace, pulse <em>Escribir</em> y acerque el tag al teléfono.</li>
                    </ol>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-xs font-bold text-blue-900 block mb-1">
                    💡 Consejo de Mantenimiento de Etiquetas en Planta:
                  </span>
                  <span className="text-xs text-slate-600">
                    Limpie el chasis metálico con alcohol isopropílico antes de adherir el tag. Pegue el chip a una altura accesible (1.40 m a 1.60 m) y protéjalo con una cubierta de acrílico o mica transparente si la máquina maneja fluidos refrigerantes o virutas calientes.
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* CAPÍTULO 6 */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'cap6') && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-cyan-600">
                <span className="px-2.5 py-1 bg-cyan-600 text-white rounded-lg font-black text-xs">
                  CAPÍTULO 6
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  ALMACENAMIENTO, NUBE, SINCRONIZACIÓN Y RESPALDOS
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                <p>
                  <strong>6.1. Almacenamiento Local (Modo Desconectado / Offline):</strong> La aplicación almacena de inmediato cualquier modificación en el almacenamiento interno del navegador (`localStorage`). Si se pierde la señal de red Wi-Fi o datos móviles en la nave industrial, el operario puede continuar cambiando estados y registrando piezas sin perder un solo byte de información.
                </p>

                <p>
                  <strong>6.2. Sincronización en la Nube (Google Firebase):</strong> Para que los cambios realizados en el teléfono del operario se vean en la computadora del supervisor de inmediato, se conecta con la base de datos de Firebase Firestore (plan gratuito de Google). Esto garantiza sincronización en menos de 1 segundo entre todos los dispositivos de la planta.
                </p>

                <p>
                  <strong>6.3. Respaldos y Migración de Base de Datos:</strong>
                  En el menú de administración, el botón <strong>"Exportar / Dominio"</strong> permite descargar un archivo de copia de seguridad con toda la estructura de máquinas, registros históricos y credenciales para archivo corporativo o migración de servidores.
                </p>
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* CAPÍTULO 7 */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'cap7') && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-slate-800">
                <span className="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-black text-xs">
                  CAPÍTULO 7
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  PREGUNTAS FRECUENTES Y RESOLUCIÓN DE PROBLEMAS (FAQ)
                </h2>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    ¿Qué sucede si un teléfono no tiene lector NFC?
                  </h4>
                  <p className="text-xs text-slate-600">
                    El sistema cuenta con un selector manual en la parte superior. El operario puede elegir su máquina en 2 segundos y utilizar el 100% de las funciones sin necesidad de chip NFC.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    ¿Por qué el teléfono vibra pero no abre la máquina exacta?
                  </h4>
                  <p className="text-xs text-slate-600">
                    Verifique que el tag fue grabado con la URL completa que incluye el parámetro de la máquina (ejemplo: <code>?maquina=M-001</code>). Si se graba únicamente la raíz de la web sin el código, el sistema abrirá la terminal pero requerirá selección manual.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    ¿Cómo exporto o imprimo este documento para entregarlo a planta?
                  </h4>
                  <p className="text-xs text-slate-600">
                    Presione el botón azul <strong>"Guardar como PDF / Imprimir"</strong> en la esquina superior derecha. En la ventana de su navegador seleccione destino: <em>"Guardar como PDF"</em> y active la casilla <em>"Gráficos de fondo"</em> para conservar los colores y tablas.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              TagOps 4.0 Industrial — Manual Maestro de Operaciones
            </div>
            <div>
              Documento clasificado para uso exclusivo en planta y mantenimiento
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer (Hidden during Print) */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Presione <strong>"Guardar como PDF"</strong> para generar el archivo imprimible.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-200" />
              <span>Guardar como PDF / Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
