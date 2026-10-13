import React from 'react';
import { Radio } from 'lucide-react';

interface TagOpsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const TagOpsLogo: React.FC<TagOpsLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Industrial Tag Ops Icon */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md ring-2 ring-blue-500/20 shrink-0 relative overflow-hidden`}
      >
        <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className={`${titleSizes[size]} font-black tracking-tight text-slate-900 font-mono`}>
            TAG<span className="text-blue-600 font-extrabold">OPS</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-cyan-300 font-mono tracking-wider">
            NFC 4.0
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sistema Operativo de Mantenimiento & Planta
          </p>
        )}
      </div>
    </div>
  );
};
