import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Toast = () => {
  const { toast } = useAuth();
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info class="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40 bg-stone-900/95';
      case 'warning':
        return 'border-amber-500/40 bg-stone-900/95';
      default:
        return 'border-sky-500/40 bg-stone-900/95';
    }
  };

  return (
    <div class="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div class={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${getBorder()} text-stone-100 text-sm max-w-sm`}>
        {getIcon()}
        <span class="font-medium text-xs sm:text-sm">{toast.message}</span>
      </div>
    </div>
  );
};
