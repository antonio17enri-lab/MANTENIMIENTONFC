import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AppUser } from '../types';
import { TagOpsLogo } from './TagOpsLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: AppUser) => void;
  users: AppUser[];
  requiredActionDescription?: string; // e.g., "Para agregar una nueva máquina se requiere acceso de Administrador"
  requireAdmin?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  requiredActionDescription,
  requireAdmin = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const user = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setErrorMessage('El usuario ingresado no existe en el sistema.');
      return;
    }

    if (user.passwordHash !== password) {
      setErrorMessage('Contraseña incorrecta. Verifique sus credenciales.');
      return;
    }

    if (requireAdmin && user.role !== 'admin') {
      setErrorMessage('Esta acción requiere permisos de Administrador.');
      return;
    }

    onLoginSuccess(user);
    if (onClose) onClose();
  };

  const handleQuickLogin = (demoUsername: string, demoPass: string) => {
    setUsername(demoUsername);
    setPassword(demoPass);
    const user = users.find((u) => u.username === demoUsername);
    if (user) {
      onLoginSuccess(user);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <div className="flex justify-center mb-2">
            <TagOpsLogo size="md" showSubtitle={false} />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white mt-1">
            {requireAdmin ? 'Acceso de Administrador' : 'Control de Acceso Industrial'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {requiredActionDescription || 'Ingresa tus credenciales para acceder a la terminal de inspección'}
          </p>

          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Usuario</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: admin u operador"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Contraseña</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>Ingresar al Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Access Helpers */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Acceso Rápido de Prueba (Credenciales por defecto)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left cursor-pointer transition-all"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  admin / admin123
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operador', 'operador123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left cursor-pointer transition-all"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                  <User className="w-3 h-3 text-emerald-600" />
                  <span>Operario</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  operador / operador123
                </div>
              </button>
            </div>
          </div>

        </form>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          TAG OPS • Sistema Protegido contra accesos no autorizados por NFC
        </div>

      </div>
    </div>
  );
};
