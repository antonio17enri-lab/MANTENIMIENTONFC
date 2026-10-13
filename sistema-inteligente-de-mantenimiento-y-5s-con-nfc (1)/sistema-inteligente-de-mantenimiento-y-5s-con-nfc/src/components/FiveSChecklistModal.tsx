import React, { useState } from 'react';
import { X, CheckSquare, Star, Award, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { Machine, FiveSAudit, FiveSCategoryScore } from '../types';
import { SignaturePad } from './SignaturePad';

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
  const [categories, setCategories] = useState<FiveSCategoryScore[]>(
    machine.latest5S.categories.map((cat) => ({
      ...cat,
      criteria: cat.criteria.map((c) => ({ ...c })),
    }))
  );
  const [observations, setObservations] = useState<string>(
    machine.latest5S.observations || ''
  );

  if (!isOpen) return null;

  // Toggle criteria question
  const handleToggleCriterion = (catIndex: number, critIndex: number) => {
    const updated = [...categories];
    const item = updated[catIndex].criteria[critIndex];
    item.passed = !item.passed;

    // Recalculate category score based on passed criteria ratio (or minimum 70%)
    const passedCount = updated[catIndex].criteria.filter((c) => c.passed).length;
    const totalCount = updated[catIndex].criteria.length || 1;
    updated[catIndex].score = Math.round((passedCount / totalCount) * 100);

    setCategories(updated);
  };

  const handleScoreChange = (catIndex: number, newScore: number) => {
    const updated = [...categories];
    updated[catIndex].score = Math.min(100, Math.max(0, newScore));
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
              <div className="text-2xl font-black text-emerald-700">
                {generalCompliance}%
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">
                {generalCompliance >= 85 ? 'Nivel Sobresaliente (A)' : generalCompliance >= 75 ? 'Nivel Aceptable (B)' : 'Requiere Plan de Acción (C)'}
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
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
              Evaluación por Pilares 5S:
            </span>

            {categories.map((cat, catIdx) => (
              <div
                key={cat.category}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-900 text-xs">
                      {cat.category} <span className="font-mono text-[10px] text-slate-400 font-normal">({cat.japaneseName})</span>
                    </span>
                  </div>
                  
                  {/* Slider or score input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={cat.score}
                      onChange={(e) => handleScoreChange(catIdx, Number(e.target.value))}
                      className="w-20 accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-black text-emerald-700 font-mono w-9 text-right">
                      {cat.score}%
                    </span>
                  </div>
                </div>

                {/* Criteria items checklist */}
                {cat.criteria.length > 0 && (
                  <div className="space-y-1.5 pl-4 pt-1 border-t border-slate-200/60">
                    {cat.criteria.map((crit, critIdx) => (
                      <label
                        key={critIdx}
                        className="flex items-start gap-2 cursor-pointer text-slate-600 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={crit.passed}
                          onChange={() => handleToggleCriterion(catIdx, critIdx)}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-[11px] leading-tight">{crit.question}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
