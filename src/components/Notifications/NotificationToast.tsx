import React, { useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../i18n/context/LanguageContext';
import {
  Bell,
  AlertTriangle,
  PlaneTakeoff,
  Activity,
  UserCheck,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast, onNavigateFeature, markAsRead } = useNotifications();
  const { t } = useLanguage();

  // Auto-dismiss toast after 8 seconds (unless user manually interacts)
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 9000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'disaster':
        return <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />;
      case 'early_alert':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />;
      case 'autopilot':
        return <PlaneTakeoff className="w-5 h-5 text-cyan-400 shrink-0" />;
      case 'what_changed':
        return <Activity className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'advisory':
        return <UserCheck className="w-5 h-5 text-purple-400 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (activeToast.severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-950/90 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.3)]';
      case 'warning':
        return 'border-amber-500/50 bg-amber-950/90 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
      case 'success':
        return 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      default:
        return 'border-cyan-500/40 bg-slate-900/95 text-slate-100 shadow-[0_0_20px_rgba(6,182,212,0.25)]';
    }
  };

  const handleActionClick = () => {
    markAsRead(activeToast.id);
    if (activeToast.actionFeature && onNavigateFeature) {
      onNavigateFeature(activeToast.actionFeature);
    }
    dismissToast();
  };

  return (
    <div
      id="notification-toast-popup"
      className="fixed bottom-6 right-4 sm:right-6 z-[9999] max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      role="alert"
    >
      <div className={`p-4 rounded-2xl border backdrop-blur-xl ${getBorderColor()} shadow-2xl flex flex-col gap-2.5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-slate-900/70 border border-white/10 shrink-0">
              {getIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold tracking-tight text-white truncate">
                  {activeToast.title}
                </h4>
                <span className="text-[10px] opacity-75 font-mono shrink-0">
                  {activeToast.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-200/90 mt-1 leading-relaxed line-clamp-3">
                {activeToast.message}
              </p>
            </div>
          </div>

          <button
            id="dismiss-toast-btn"
            onClick={dismissToast}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
            title={t('dismiss', 'Dismiss')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeToast.actionFeature && (
          <div className="flex items-center justify-end pt-2 border-t border-white/10 gap-2">
            <button
              onClick={dismissToast}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
            >
              {t('dismiss', 'Dismiss')}
            </button>
            <button
              onClick={handleActionClick}
              className="px-3 py-1 text-[11px] font-semibold bg-white/15 hover:bg-white/25 rounded-lg text-white transition-all flex items-center gap-1 active:scale-95"
            >
              <span>{t('viewDetails', 'View Details')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
