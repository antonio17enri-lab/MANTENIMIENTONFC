import React, { useState } from 'react';
import { X, CheckSquare, Award, AlertCircle, CheckCircle2, Sliders, ChevronDown } from 'lucide-react';
import { Machine, FiveSAudit, FiveSCategoryScore } from '../types';
import { SignaturePad } from './SignaturePad';

// Standard 5S criteria questions used if a machine has an empty list
export const STANDARD_5S_CRITERIA_MAP: Record<string, string[]> = {
  'Clasificación': [
    'Solo herramientas y materiales de trabajo activos del turno en el área',
    'Sin piezas de descarte o virutas acumuladas sin clasificar',
    'Materiales sobrantes y materias primas devueltos a almacén central',
  ],
  'Orden': [
    'Herramientas organizadas en tablero o panel sombreado identificado',
    'Llaves y accesorios de ajuste sujetos con cable o soporte seguro',
    'Delimitación visible de pasillos, topes y áreas de trabajo con señalización',
  ],
  'Limpieza': [
    'Bandeja colectora de residuos limpia y vaciada',
    'Bancada y chasis libre de polvo abrasivo, virutas y lubricada adecuadamente',
    'Piso circundante sin restos de taladrina, grasa, aceite o agua',
  ],
  'Estandarización': [
    'Checklist de inspección diaria de inicio de turno completado y firmado',
    'Niveles de lubricante e indicadores visuales de máx/mín claros y limpios',
    'Etiqueta NFC limpia, legible y visible en chasis frontal del equipo',
  ],
  'Disciplina': [
    'Uso obligatorio del EPP reglamentario completo (gafas, botas dieléctricas)',
    'Cumplimiento y prueba del protocolo de parada de emergencia',
    'Registro digital inmediato en tag NFC al cambiar estado o turno',
  ],
  'Seguridad': [
    'Guardas de protección físicas y microinterruptores de seguridad operativos',
    'Pulsador tipo seta de paro de emergencia accesible y desbloqueado',
    'Extintor y botiquín vigentes y libres de obstáculos a menos de 5 metros',
  ],
};

interface FiveSChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
  onSaveAudit: (audit: FiveSAudit) => void;
}

export const FiveSChecklistModal: React.FC<FiveSChecklistModalProps> = ({
  isOpen,
  onClose,
  machine,
  onSaveAudit,
}) => {
  const [auditor, setAuditor] = useState<string>('Ing. Rodrigo Morales');
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  
  // Initialize categories ensuring each category has interactive criteria checkboxes
  const [categories, setCategories] = useState<FiveSCategoryScore[]>(() => {
    return machine.latest5S.categories.map((cat) => {
      let criteria = cat.criteria && cat.criteria.length > 0
        ? cat.criteria.map((c) => ({ ...c }))
        : [];

      // If empty criteria, populate with standard criteria according to category
      if (criteria.length === 0) {
        const standardList = STANDARD_5S_CRITERIA_MAP[cat.category] || STANDARD_5S_CRITERIA_MAP['Seguridad'];
        criteria = standardList.map((q) => ({
          question: q,
          passed: cat.score >= 80, // Default according to initial score
        }));
      }

      // Compute initial score based strictly on passed ratio
      const passedCount = criteria.filter((c) => c.passed).length;
      const initialScore = criteria.length > 0
        ? Math.round((passedCount / criteria.length) * 100)
        : cat.score;

      return {
        ...cat,
        score: initialScore,
        criteria,
      };
    });
  });

  const [observations, setObservations] = useState<string>(
    machine.latest5S.observations || ''
  );

  if (!isOpen) return null;

  // Toggle criteria question: updates check AND updates category score automatically
  const handleToggleCriterion = (catIndex: number, critIndex: number) => {
    const updated = [...categories];
    const category = { ...updated[catIndex] };
    const criteria = category.criteria.map((c, idx) =>
      idx === critIndex ? { ...c, passed: !c.passed } : { ...c }
    );
    category.criteria = criteria;

    // Recalculate score directly: (passed / total) * 100
    // If all passed: 100%. If none: 0%. If 2 of 3: 67%.
    const passedCount = criteria.filter((c) => c.passed).length;
    const totalCount = criteria.length || 1;
    category.score = Math.round((passedCount / totalCount) * 100);

    updated[catIndex] = category;
    setCategories(updated);
  };

  // Direct score adjustment via slider (0 to 100%)
  const handleScoreChange = (catIndex: number, newScore: number) => {
    const updated = [...categories];
    const category = { ...updated[catIndex] };
    category.score = Math.min(100, Math.max(0, newScore));

    // Also synchronize criteria passed checkboxes according to score
    // e.g. If user drags slider down to 0%, all boxes uncheck.
    // If user drags up to 100%, all boxes check.
    const totalCrit = category.criteria.length;
    if (totalCrit > 0) {
      const targetPassedCount = Math.round((category.score / 100) * totalCrit);
      category.criteria = category.criteria.map((c, idx) => ({
        ...c,
        passed: idx < targetPassedCount,
      }));
    }

    updated[catIndex] = category;
    setCategories(updated);
  };

  // Quick helper to check or uncheck all criteria in a category
  const handleSetCategoryAll = (catIndex: number, passed: boolean) => {
    const updated = [...categories];
    const category = { ...updated[catIndex] };
    category.criteria = category.criteria.map((c) => ({ ...c, passed }));
    category.score = passed ? 100 : 0;
    updated[catIndex] = category;
    setCategories(updated);
  };

  // Calculate live general compliance
  const generalCompliance = Math.round(
    categories.reduce((acc, c) => acc + c.score, 0) / (categories.length || 1)
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = new Date().toISOString().split('T')[0].split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const newAudit: FiveSAudit = {
      id: `5s-${machine.code}-${Date.now()}`,
      date: formattedDate,
      auditor,
      generalCompliance,
      categories,
      observations,
      signatureUrl: signatureUrl || undefined,
    };

    onSaveAudit(newAudit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Nueva Auditoría 5S / 6S</h3>
              <p className="text-[11px] text-emerald-100">
                Puesto de trabajo: <strong className="text-white">{machine.code}</strong> - {machine.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Live Score Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Cumplimiento Calculado
              </span>
              <div className="text-3xl font-black text-emerald-700 font-mono">
                {generalCompliance}%
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">
                {generalCompliance >= 85 ? '🟢 Nivel Sobresaliente (A)' : generalCompliance >= 70 ? '🟡 Nivel Aceptable (B)' : '🔴 Requiere Plan de Acción (C)'}
              </span>
            </div>

            <div className="text-right">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Auditor:</label>
              <input
                type="text"
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
                className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                required
              />
            </div>
          </div>

          {/* 5S Pillars List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                Evaluación por Pilares 5S (Toca casillas o desliza el puntero):
              </span>
              <span className="text-[10px] text-slate-400">Escala 0% - 100%</span>
            </div>

            {categories.map((cat, catIdx) => {
              const passedCount = cat.criteria.filter((c) => c.passed).length;
              const totalCount = cat.criteria.length;

              return (
                <div
                  key={cat.category}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="font-bold text-slate-900 text-xs">
                        {cat.category} <span className="font-mono text-[10px] text-slate-400 font-normal">({cat.japaneseName})</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({passedCount}/{totalCount} aprobados)
                      </span>
                    </div>
                    
                    {/* Slider or score input */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetCategoryAll(catIdx, cat.score < 100)}
                        className="text-[10px] font-bold text-slate-500 hover:text-blue-600 px-1.5 py-0.5 rounded bg-white border border-slate-200 cursor-pointer"
                        title="Marcar todo aprobado o desmarcar"
                      >
                        {cat.score === 100 ? 'Desmarcar' : 'Aprobar Todo'}
                      </button>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={cat.score}
                        onChange={(e) => handleScoreChange(catIdx, Number(e.target.value))}
                        className="w-20 accent-emerald-600 cursor-pointer"
                        title="Baja o sube la calificación con el puntero"
                      />
                      <span className={`font-black font-mono w-10 text-right text-xs ${
                        cat.score >= 80 ? 'text-emerald-700' : cat.score >= 50 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {cat.score}%
                      </span>
                    </div>
                  </div>

                  {/* Criteria items checklist */}
                  {cat.criteria.length > 0 && (
                    <div className="space-y-1.5 pl-3 pt-2 border-t border-slate-200/60">
                      {cat.criteria.map((crit, critIdx) => (
                        <label
                          key={critIdx}
                          className="flex items-start gap-2 cursor-pointer text-slate-600 hover:text-slate-900 group"
                        >
                          <input
                            type="checkbox"
                            checked={crit.passed}
                            onChange={() => handleToggleCriterion(catIdx, critIdx)}
                            className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                          <span className={`text-[11px] leading-tight select-none transition-colors ${
                            crit.passed ? 'text-slate-900 font-medium' : 'text-slate-400 group-hover:text-slate-600'
                          }`}>
                            {crit.question}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Observations */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Observaciones y Compromisos de Mejora:
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Describa acciones correctivas acordadas con el operador..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Auditor Signature */}
          <SignaturePad
            onSave={(url) => setSignatureUrl(url)}
            label="Firma de conformidad del auditor de calidad"
          />

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Firmar y Registrar Auditoría</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
