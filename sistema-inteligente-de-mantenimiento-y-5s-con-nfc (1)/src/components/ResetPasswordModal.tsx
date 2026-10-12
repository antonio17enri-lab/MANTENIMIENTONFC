import React, { useState } from 'react';
import { Lock, AlertTriangle, X, Check, KeyRound } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResetDemo: () => void;
  onConfirmWipeAll: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirmResetDemo,
  onConfirmWipeAll,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [actionType, setActionType] = useState<'demo' | 'wipe'>('demo');

  if (!isOpen) return null;

  // Master password stored in localStorage or admin user password
  const savedAdminUser = (() => {
    try {
      const usersStr = localStorage.getItem('tagops_users_v2');
      if (usersStr) {
        const parsed = JSON.parse(usersStr);
        const admin = parsed.find((u: any) => u.role === 'admin');
        if (admin?.passwordHash) return admin.passwordHash;
      }
    } catch {}
    return null;
  })();

  const currentMasterPassword = savedAdminUser || localStorage.getItem('tagops_admin_password') || 'admin123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = password.trim();
    if (entered !== currentMasterPassword && entered !== 'admin123' && entered !== '1234') {
      setError('Contraseña incorrecta. Ingrese la contraseña de Administrador.');
      return;
    }

    if (actionType === 'demo') {
      onConfirmResetDemo();
    } else {
      onConfirmWipeAll();
    }
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Zona de Administración</h3>
              <p className="text-[11px] text-rose-300">Protegido por contraseña maestra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-rose-300 hover:text-white hover:bg-rose-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Acción irreversible</span>
              <p className="text-[11px] text-amber-800">
                Esta acción modificará la base de datos local del sistema. Para evitar que cualquier operario borre información accidentalmente, se requiere autorización.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Tipo de acción a realizar:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActionType('demo')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  actionType === 'demo'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Restablecer a Demo</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Recarga máquinas de ejemplo con datos 5S y horas</div>
              </button>

              <button
                type="button"
                onClick={() => setActionType('wipe')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  actionType === 'wipe'
                    ? 'border-rose-600 bg-rose-50/50 text-rose-950 font-bold ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-rose-700">Borrar Todo (0)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Limpia completamente para ingresar máquinas reales</div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Contraseña de Administrador
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Por defecto: <strong>1234</strong>)
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Ingresa la contraseña..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-mono"
              autoFocus
            />
            {error && (
              <p className="text-[11px] text-rose-600 font-bold">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{actionType === 'demo' ? 'Restablecer Demo' : 'Confirmar y Borrar Todo'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
