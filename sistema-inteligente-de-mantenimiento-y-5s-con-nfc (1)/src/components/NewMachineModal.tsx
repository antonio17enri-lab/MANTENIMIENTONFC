import React, { useState } from 'react';
import { X, PlusCircle, Radio, Check, Copy, ExternalLink, Camera, QrCode, Share2, Smartphone, ArrowRight } from 'lucide-react';
import { Machine } from '../types';
import { PhotoCapture } from './PhotoCapture';

interface NewMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMachine: (newMachine: Machine) => void;
  existingCount: number;
}

export const NewMachineModal: React.FC<NewMachineModalProps> = ({
  isOpen,
  onClose,
  onSaveMachine,
  existingCount,
}) => {
  const nextNum = String(existingCount + 1).padStart(3, '0');
  const [code, setCode] = useState(`M-${nextNum}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('TORNO');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState('Área de Producción');
  const [stationId, setStationId] = useState('Estación 1');
  const [responsible, setResponsible] = useState('');
  const [description, setDescription] = useState('');
  const [power, setPower] = useState('10 HP');
  const [rpm, setRpm] = useState('1800 RPM');
  const [voltage, setVoltage] = useState('380V Trifásico');
  const [imageUrl, setImageUrl] = useState('');

  // Financial & Production Parameters (User prompt requirement)
  const [expectedUnitsPerMonth, setExpectedUnitsPerMonth] = useState<number>(500);
  const [monthlyFixedCost, setMonthlyFixedCost] = useState<number>(12000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(20);
  const [salePricePerUnit, setSalePricePerUnit] = useState<number>(45);
  const [maintenanceBudget, setMaintenanceBudget] = useState<number>(4000);
  const [replacementEstimatedCost, setReplacementEstimatedCost] = useState<number>(25000);
  const [replacementAlertThresholdPct, setReplacementAlertThresholdPct] = useState<number>(70);

  // Live calculation of break-even for modal preview
  const marginPerUnit = Math.max(0.1, salePricePerUnit - variableCostPerUnit);
  const calculatedBreakEvenUnits = marginPerUnit > 0 ? Math.round(monthlyFixedCost / marginPerUnit) : 0;
  const calculatedBreakEvenQuetzales = calculatedBreakEvenUnits * salePricePerUnit;

  // Step state: 'form' | 'nfc-ready'
  const [step, setStep] = useState<'form' | 'nfc-ready'>('form');
  const [createdMachine, setCreatedMachine] = useState<Machine | null>(null);
  const [copied, setCopied] = useState(false);
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcWriteResult, setNfcWriteResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const newMachine: Machine = {
      id: `m-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      category: category.toUpperCase().trim(),
      brand: brand.trim() || 'Genérico',
      model: model.trim() || 'Estándar',
      year: Number(year) || new Date().getFullYear(),
      location: location.trim(),
      stationId,
      responsible: responsible.trim() || 'Operario de turno',
      description: description.trim() || `${name} instalada en ${location}.`,
      status: 'OPERATIVA',
      nextRevisionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      lastMaintenanceType: 'Preventivo',
      maintenanceHistory: [],
      failures: [],
      latest5S: {
        id: `5s-${Date.now()}`,
        date: new Date().toLocaleDateString('es-ES'),
        auditor: 'Auditor Inicial',
        generalCompliance: 85,
        categories: [
          { category: 'Clasificación', japaneseName: 'Seiri', score: 85, criteria: [] },
          { category: 'Orden', japaneseName: 'Seiton', score: 85, criteria: [] },
          { category: 'Limpieza', japaneseName: 'Seiso', score: 85, criteria: [] },
          { category: 'Estandarización', japaneseName: 'Seiketsu', score: 85, criteria: [] },
          { category: 'Disciplina', japaneseName: 'Shitsuke', score: 85, criteria: [] },
          { category: 'Seguridad', japaneseName: 'Safety', score: 90, criteria: [] },
        ],
        observations: 'Máquina recién registrada en TAG OPS.',
      },
      documents: [],
      specs: {
        power,
        rpm,
        voltage,
      },
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      productionMetrics: {
        availableHours: 160,
        workedHours: 0,
        stoppedHours: 0,
        producedUnits: 0,
        expectedUnits: Number(expectedUnitsPerMonth) || 500,
      },
      financials: {
        monthlyFixedCost: Number(monthlyFixedCost) || 12000,
        variableCostPerUnit: Number(variableCostPerUnit) || 20,
        salePricePerUnit: Number(salePricePerUnit) || 45,
        expectedUnitsPerMonth: Number(expectedUnitsPerMonth) || 500,
        maintenanceBudget: Number(maintenanceBudget) || 4000,
        replacementEstimatedCost: Number(replacementEstimatedCost) || 25000,
        replacementAlertThresholdPct: Number(replacementAlertThresholdPct) || 70,
      },
      productionHistory: [],
    };

    onSaveMachine(newMachine);
    setCreatedMachine(newMachine);
    setStep('nfc-ready');
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://tudominio.com';
  const tagUrl = createdMachine ? `${currentOrigin}/?maquina=${createdMachine.code}` : '';

  const handleCopyTagUrl = () => {
    navigator.clipboard.writeText(tagUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWriteNfc = async () => {
    if (!('NDEFReader' in window)) {
      setNfcWriteResult('Tu navegador actual no tiene Web NFC nativo. Usa la app gratuita "NFC Tools" en tu teléfono.');
      return;
    }

    try {
      setNfcWriting(true);
      setNfcWriteResult('Acerca tu teléfono al tag NFC ahora mismo para grabarlo...');
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: tagUrl }],
      });
      setNfcWriteResult('✅ ¡Tag NFC grabado con éxito para esta máquina!');
    } catch (err) {
      console.error(err);
      setNfcWriteResult('Error al grabar el tag. Asegúrate de tener NFC encendido en los ajustes del teléfono.');
    } finally {
      setNfcWriting(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setCreatedMachine(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              {step === 'form' ? <PlusCircle className="w-4 h-4" /> : <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />}
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {step === 'form' ? 'Registrar Nueva Máquina' : 'Configurar Etiqueta NFC Física'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 'form' ? 'Crea la ficha y genera su código NFC' : `Vincular tag a ${createdMachine?.code}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Código de Máquina *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ej. M-007"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="TORNO">TORNO</option>
                  <option value="FRESADORA">FRESADORA</option>
                  <option value="PRENSA">PRENSA</option>
                  <option value="CNC">CNC</option>
                  <option value="SOLDADURA">SOLDADURA</option>
                  <option value="COMPRESOR">COMPRESOR</option>
                  <option value="INYECTORA">INYECTORA</option>
                  <option value="OTRO">OTRO EQUIPO</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nombre descriptivo del equipo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Torno Revolver CNC de Precisión"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Marca</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="ej. Haas, Nardini"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="ej. ST-10"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Año</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Área / Ubicación</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ej. Nave 2, Mecanizado"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Operario Responsable</label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="ej. Mario Gómez"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            {/* Photo Capture */}
            <PhotoCapture
              onPhotoCaptured={(photo) => setImageUrl(photo)}
              label="Foto de la máquina (Opcional)"
            />

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 text-[10px]">Potencia</label>
                <input
                  type="text"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 text-[10px]">RPM / Velocidad</label>
                <input
                  type="text"
                  value={rpm}
                  onChange={(e) => setRpm(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 text-[10px]">Voltaje</label>
                <input
                  type="text"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Financial Parameters Section */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-blue-900 block">
                    Cálculo de Punto de Equilibrio y Finanzas
                  </span>
                  <span className="text-[10px] text-blue-700">
                    Ingresa los costos y producción para el cálculo automático
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                  Moneda: Quetzales (Q)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">
                    Capacidad / Prod. Esperada (Unidades/Mes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expectedUnitsPerMonth}
                    onChange={(e) => setExpectedUnitsPerMonth(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">
                    Costo Fijo Mensual de la Máquina (Q)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyFixedCost}
                    onChange={(e) => setMonthlyFixedCost(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">
                    Costo Unitario de Producción (Q/Unidad)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={variableCostPerUnit}
                    onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">
                    Precio de Venta Estimado (Q/Unidad)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={salePricePerUnit}
                    onChange={(e) => setSalePricePerUnit(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Control Presupuestario y Reemplazo Fields */}
              <div className="pt-2 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px]">
                    Presupuesto de Mantenimiento (Q)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={maintenanceBudget}
                    onChange={(e) => setMaintenanceBudget(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    placeholder="4000"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Tope para alertas de sobregiro</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px]">
                    Costo Reemplazo (Máquina Nueva) (Q)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    value={replacementEstimatedCost}
                    onChange={(e) => setReplacementEstimatedCost(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                    placeholder="25000"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Para evaluar comprar vs reparar</span>
                </div>
              </div>

              {/* Automatic Calculation Preview */}
              <div className="p-2.5 bg-white rounded-xl border border-blue-100 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-500">Margen por unidad: </span>
                  <strong className="text-slate-800 font-mono">Q{marginPerUnit.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Punto de Equilibrio: </span>
                  <strong className="text-blue-700 font-mono font-black">{calculatedBreakEvenUnits} unid.</strong>
                  <span className="text-slate-400 font-mono text-[10px]"> (Q{calculatedBreakEvenQuetzales.toLocaleString()})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar y Configurar Tag NFC</span>
              </button>
            </div>

          </form>
        ) : (
          /* Step 2: NFC configuration or Link Generation options */
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-950">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </div>
              <div>
                <span className="font-bold text-sm block">¡Máquina {createdMachine?.code} registrada con éxito!</span>
                <p className="text-[11px] text-emerald-800">
                  {createdMachine?.name} — Elige cómo deseas vincularla: grabando tu etiqueta NFC física o usando el link directo.
                </p>
              </div>
            </div>

            {/* TWO MAIN CHOICES TABS / CARDS */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Choice A: Direct Link */}
              <div className="p-3.5 bg-blue-50/70 border-2 border-blue-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <h4 className="font-black text-slate-900 text-xs">Opción A: Link Directo</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Accede a la máquina desde cualquier tablet o celular escaneando QR o abriendo el link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTagUrl}
                  className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              {/* Choice B: Write to NFC Tag */}
              <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs">
                    <Radio className="w-4 h-4 text-cyan-200 animate-pulse" />
                  </div>
                  <h4 className="font-black text-slate-900 text-xs">Opción B: Grabar en NFC</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Escribe la URL directamente en el chip o etiqueta física con tu teléfono o tablet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleWriteNfc}
                  disabled={nfcWriting}
                  className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{nfcWriting ? 'Acerca el Tag...' : 'Grabar en Tag'}</span>
                </button>
              </div>

            </div>

            {/* Generated Link Display Box */}
            <div className="space-y-1.5 bg-slate-900 rounded-2xl p-3.5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Link permanente de la máquina:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {createdMachine?.code}</span>
              </div>
              
              <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-[11px] text-cyan-200 break-all select-all flex items-center justify-between gap-2">
                <span>{tagUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyTagUrl}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer shrink-0"
                  title="Copiar"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>Al abrir este link en cualquier dispositivo se abrirá directamente {createdMachine?.code}.</span>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.share({
                        title: `Máquina ${createdMachine?.code}`,
                        text: `Acceso a ficha de ${createdMachine?.name}`,
                        url: tagUrl,
                      }).catch(() => {});
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Compartir</span>
                  </button>
                )}
              </div>
            </div>

            {/* NFC Write Feedback Result */}
            {nfcWriteResult && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] font-bold text-blue-950 flex items-start gap-2">
                <Radio className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{nfcWriteResult}</span>
              </div>
            )}

            {/* Guide to write NFC tag using NFC Tools (Android/iOS) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                ¿Cómo grabar la etiqueta física con la app gratuita NFC Tools?
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-600">
                <li>Copia el link de arriba con el botón <strong>"Copiar Link"</strong>.</li>
                <li>Abre la app <strong>NFC Tools</strong> (Android / iPhone).</li>
                <li>Presiona <strong>Escribir</strong> (Write) → <strong>Añadir un registro</strong> → <strong>URL / Enlace web</strong>.</li>
                <li>Pega el enlace y pulsa <strong>Escribir</strong>; luego acerca la etiqueta a tu teléfono.</li>
              </ol>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(tagUrl, '_blank');
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Probar link en nueva pestaña</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                Finalizar y Ver Máquina
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
