import React from 'react';
import { UniqueFeatureTab } from '../../types/uniqueFeatures';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  PlaneTakeoff,
  Navigation,
  Activity,
  History,
  ShieldAlert,
  UserCheck,
  Sparkles,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface FeatureSidebarProps {
  activeTab: UniqueFeatureTab;
  onSelectTab: (tab: UniqueFeatureTab) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const FeatureSidebar: React.FC<FeatureSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen = true,
  onToggle,
  className = '',
}) => {
  const { t } = useLanguage();
  const { notifications } = useNotifications();

  // Count active alerts for badges
  const disasterCount = notifications.filter((n) => n.type === 'disaster' && !n.read).length;
  const earlyAlertCount = notifications.filter((n) => n.type === 'early_alert' && !n.read).length;

  const NAV_ITEMS: Array<{
    id: UniqueFeatureTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    tag?: string;
  }> = [
    {
      id: 'dashboard',
      label: t('navLiveDashboard', 'Live Dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'autopilot',
      label: t('navWeatherAutopilot', 'Weather Autopilot'),
      icon: PlaneTakeoff,
      badge: earlyAlertCount > 0 ? earlyAlertCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      tag: 'Smart',
    },
    {
      id: 'route',
      label: t('navRouteIntelligence', 'Route Intelligence'),
      icon: Navigation,
      tag: 'AI',
    },
    {
      id: 'what_changed',
      label: t('navWhatChanged', 'What Changed'),
      icon: Activity,
    },
    {
      id: 'history',
      label: t('navWeatherHistory', 'Weather History'),
      icon: History,
      tag: '2 Years',
    },
    {
      id: 'disasters',
      label: t('navDisasterAlerts', 'Disaster & History'),
      icon: ShieldAlert,
      badge: disasterCount > 0 ? disasterCount : undefined,
      badgeColor: 'bg-red-500 text-white font-bold animate-pulse',
    },
    {
      id: 'advisory',
      label: t('navUserAdvisory', 'User Advisory'),
      icon: UserCheck,
      tag: 'Roles',
    },
  ];

  // Collapsed Sidebar View (Minimal horizontal space with 3-line hamburger menu icon)
  if (!isOpen) {
    return (
      <aside
        id="unique-features-sidebar-collapsed"
        className={`glass-panel p-2 rounded-2xl border border-cyan-500/30 shadow-xl backdrop-blur-2xl inline-flex items-center gap-2 transition-all duration-300 ${className}`}
        aria-label="Collapsed AI Weather Suites Navigation"
      >
        <button
          id="sidebar-expand-btn"
          onClick={onToggle}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 shadow-md transition-all active:scale-95 group cursor-pointer"
          title="Open AI Weather Suites (Expand Sidebar)"
          aria-label="Open AI Weather Suites"
          aria-expanded="false"
        >
          {/* Three-line hamburger icon */}
          <Menu className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 shrink-0" />
          <span className="text-xs font-bold tracking-tight text-slate-200 group-hover:text-cyan-200">
            {t('uniqueFeaturesHeading', 'AI Weather Suites')}
          </span>
          {(disasterCount > 0 || earlyAlertCount > 0) && (
            <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </button>
      </aside>
    );
  }

  // Expanded Sidebar View (Full menu with toggle to collapse)
  return (
    <aside
      id="unique-features-sidebar"
      className={`glass-panel p-3.5 sm:p-4 rounded-3xl border border-cyan-500/25 shadow-2xl flex flex-col justify-between backdrop-blur-2xl transition-all duration-300 ${className}`}
      aria-label="Unique Features Navigation"
    >
      <div className="space-y-3.5">
        {/* Sidebar Header with 3-line hamburger toggle */}
        <div className="px-1.5 pt-0.5 flex items-center justify-between gap-2 pb-2.5 border-b border-slate-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
              {t('uniqueFeaturesHeading', 'AI Weather Suites')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
              v2.5
            </span>
            {onToggle && (
              <button
                id="sidebar-collapse-btn"
                onClick={onToggle}
                className="p-1.5 rounded-xl text-slate-300 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-cyan-500/40 transition-all active:scale-95 cursor-pointer"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
                aria-expanded="true"
              >
                <Menu className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Item Buttons */}
        <nav className="space-y-1.5" role="tablist">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-xs transition-all group active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? 'sidebar-nav-active bg-gradient-to-r from-cyan-500/25 to-blue-600/20 text-cyan-200 border border-cyan-500/50 shadow-[0_0_18px_rgba(6,182,212,0.15)] font-bold'
                    : 'sidebar-nav-inactive text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={`sidebar-nav-icon p-2 rounded-xl border transition-all shrink-0 ${
                      isActive
                        ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/80 group-hover:text-slate-200 group-hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="sidebar-nav-label truncate text-left">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-cyan-500 text-slate-950 font-bold'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.tag && !item.badge && (
                    <span className="sidebar-nav-tag text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 group-hover:text-slate-300 font-mono border border-slate-700">
                      {item.tag}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="sidebar-nav-chevron w-3.5 h-3.5 text-cyan-400 opacity-90 shrink-0 font-bold" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Insight */}
      <div className="sidebar-footer pt-3 mt-3 border-t border-slate-700/40 px-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="truncate">{t('continuousMonitoring', 'Continuous Monitoring')}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      </div>
    </aside>
  );
};

