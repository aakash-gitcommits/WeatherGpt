import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../i18n/context/LanguageContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  PlaneTakeoff,
  Activity,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppNotification, UniqueFeatureTab } from '../../types/uniqueFeatures';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature?: (tab: UniqueFeatureTab) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
}) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } =
    useNotifications();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'autopilot' | 'early_alert' | 'disaster' | 'what_changed' | 'advisory'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'disaster':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'early_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'autopilot':
        return <PlaneTakeoff className="w-4 h-4 text-cyan-400" />;
      case 'what_changed':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'advisory':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.actionFeature && onSelectFeature) {
      onSelectFeature(notif.actionFeature);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-cyan-500/20 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{t('notificationCenter', 'Notification Center')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-normal">
                  {notifications.length} {t('totalNotifs', 'Total')}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t('notificationCenterSub', 'Real-time meteorological alerts, autopilot updates, and weather changes')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills and Actions */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/40">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            {[
              { key: 'all', label: t('filterAll', 'All') },
              { key: 'early_alert', label: t('earlyAlertsTab', 'Early Alerts') },
              { key: 'autopilot', label: t('autopilotTab', 'Autopilot') },
              { key: 'disaster', label: t('disastersTab', 'Disasters') },
              { key: 'what_changed', label: t('whatChangedTab', 'What Changed') },
              { key: 'advisory', label: t('advisoryTab', 'Advisory') },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={t('markAllRead', 'Mark all as read')}
            >
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('markAllRead', 'Mark Read')}</span>
            </button>
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
              title={t('clearAllNotifs', 'Clear all notifications')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearAllNotifs', 'Clear All')}</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Bell className="w-8 h-8 text-slate-600 mb-1" />
              <p className="text-sm font-semibold text-slate-300">
                {t('noNotificationsTitle', 'No notifications to display')}
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                {t('noNotificationsSub', 'Your atmospheric monitoring feed is calm. New weather alerts and autopilot updates will appear here.')}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                  item.read
                    ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    : item.severity === 'critical'
                    ? 'bg-red-950/30 border-red-500/30 hover:border-red-500/60 text-slate-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : item.severity === 'warning'
                    ? 'bg-amber-950/30 border-amber-500/30 hover:border-amber-500/60 text-slate-100'
                    : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-500/60 text-slate-100'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-100 truncate">
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
                      )}
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    {item.actionFeature && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-medium mt-2 group-hover:translate-x-1 transition-transform">
                        <span>{t('openFeature', 'Open feature')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  title={t('delete', 'Delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
