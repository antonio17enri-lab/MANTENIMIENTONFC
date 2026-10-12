import React from 'react';
import { Radio } from 'lucide-react';

interface TagOpsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark';
}

export const TagOpsLogo: React.FC<TagOpsLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  variant = 'light',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const titleSizes = {
    sm: 'text-sm font-bold',
    md: 'text-lg sm:text-xl font-black',
    lg: 'text-2xl sm:text-3xl font-black',
  };

  const tagColor = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const nfcBg = variant === 'dark' ? 'bg-blue-950/80 border border-blue-800' : 'bg-slate-900';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Industrial Tag Ops Icon */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md ring-2 ring-blue-500/20 shrink-0 relative overflow-hidden`}
      >
        <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
      </div>

      <div className="shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className={`${titleSizes[size]} tracking-tight ${tagColor} font-mono`}>
            TAG<span className="text-blue-500 font-black">OPS</span>
          </span>
          <span className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold ${nfcBg} text-cyan-300 font-mono tracking-wider`}>
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
