import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { TagOpsLogo } from './TagOpsLogo';
import { AppUser } from '../types';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: AppUser[];
  actionTitle?: string;
  actionDescription?: string;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  users,
  actionTitle = 'Acceso de Administrador',
  actionDescription = 'Ingrese la contraseña de Administrador para acceder al panel de supervisión y gestión.',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Find admin users passwords
  const adminUsers = users.filter((u) => u.role === 'admin');
  const validPasswords = adminUsers.map((u) => u.passwordHash);
  // Also include standard fallbacks if stored
  validPasswords.push('admin123', 'admin2025');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const entered = password.trim();
    if (!entered) {
      setError('Por favor ingrese la contraseña.');
      return;
    }

    if (validPasswords.includes(entered)) {
      setPassword('');
      setError(null);
      onSuccess();
      onClose();
    } else {
      setError('Contraseña incorrecta. Se requiere la clave de Administrador (ej: admin123).');
    }
  };

  const handleQuickUnlock = () => {
    const adminPass = adminUsers[0]?.passwordHash || 'admin123';
    setPassword(adminPass);
    setError(null);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg mb-2">
            <Shield className="w-6 h-6 text-cyan-200" />
          </div>
          <h3 className="text-base font-black text-white">{actionTitle}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {actionDescription}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Contraseña de Administrador</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese contraseña de admin"
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Shield className="w-4 h-4" />
            <span>Validar y Entrar como Admin</span>
          </button>

          {/* Quick Demo Hint */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Clave por defecto: <strong className="font-mono text-slate-800">admin123</strong></span>
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
            >
              Autocompletar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
