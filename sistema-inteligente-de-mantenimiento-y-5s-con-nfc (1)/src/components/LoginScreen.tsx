import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Radio, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { AppUser } from '../types';
import { TagOpsLogo } from './TagOpsLogo';

interface LoginScreenProps {
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
  onOpenUserManual?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess, onOpenUserManual }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const user = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setErrorMessage('El usuario ingresado no existe en el sistema.');
      return;
    }

    if (user.passwordHash !== password.trim()) {
      setErrorMessage('Contraseña incorrecta. Por favor verifique sus datos.');
      return;
    }

    onLoginSuccess(user);
  };

  const handleQuickLogin = (quickUser: string, quickPass: string) => {
    const user = users.find((u) => u.username === quickUser);
    if (user) {
      onLoginSuccess(user);
    } else {
      setUsername(quickUser);
      setPassword(quickPass);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Top Brand Bar */}
      <div className="w-full max-w-md mx-auto pt-6 pb-4 text-center">
        <div className="flex justify-center mb-3">
          <TagOpsLogo size="lg" showSubtitle={true} />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/80 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 mb-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Acceso NFC & Control Operativo</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          Terminal del Operario
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Ingrese sus credenciales de operario o administrador para gestionar la maquinaria y registrar producción
        </p>

        {/* High-visibility Manual Button */}
        {onOpenUserManual && (
          <div className="mt-3">
            <button
              type="button"
              onClick={onOpenUserManual}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg cursor-pointer transition-all hover:scale-105 border border-blue-400/40 active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-cyan-200" />
              <span>📖 Ver Manual General de Uso (PDF)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Login Card (Perfect for mobile & tablet) */}
      <div className="w-full max-w-md mx-auto bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
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
              placeholder="Ej: operador o admin"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
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
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 mt-2"
          >
            <span>Ingresar al Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick 1-Tap Demo Logins for Fast Access on Mobile */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Acceso Rápido Demo (1 Clic):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Operario Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('operador', 'operador123')}
                className="p-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-left cursor-pointer transition-all active:scale-97 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-700" /> Operario de Planta
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Entrar
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 font-mono mt-1">
                  Usuario: <span className="font-semibold">operador</span> / Clave: <span className="font-semibold">operador123</span>
                </div>
              </button>

              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-3 rounded-2xl border-2 border-blue-300 bg-blue-50/80 hover:bg-blue-100 text-left cursor-pointer transition-all active:scale-97 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-700" /> Administrador General
                  </span>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Entrar
                  </span>
                </div>
                <div className="text-[11px] text-blue-800 font-mono mt-1">
                  Usuario: <span className="font-semibold">admin</span> / Clave: <span className="font-semibold">admin123</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Manual Access Link */}
          {onOpenUserManual && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onOpenUserManual}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>📖 Consultar Manual de Uso y Operación (PDF)</span>
              </button>
            </div>
          )}

        </form>

      </div>

      {/* Footer info */}
      <div className="w-full max-w-md mx-auto py-4 text-center text-xs text-slate-500">
        <p>TAG OPS • Sistema Inteligente de Mantenimiento y 5S con NFC</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Optimizado para celulares, tablets y terminales industriales</p>
      </div>

    </div>
  );
};
