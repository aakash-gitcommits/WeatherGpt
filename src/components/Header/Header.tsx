import React, { useState, useEffect, useRef } from 'react';
import {
  CloudSun,
  Search,
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  Bell,
  Sparkles,
  ChevronDown,
  X,
  Compass,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useUnit } from '../../context/UnitContext';
import { SUPPORTED_LANGUAGES, LanguageInfo } from '../../i18n/languages';
import { LanguageCode, WeatherAlertItem } from '../../types/weather';
import { searchLocations, LocationSearchResult, POPULAR_LOCATIONS } from '../../services/weatherService';
import { getLocalizedAlert } from '../../i18n/utils';

interface HeaderProps {
  currentLocationName: string;
  onSelectLocation: (loc: LocationSearchResult) => void;
  onLocateMe: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  alerts: WeatherAlertItem[];
  onOpenNotificationCenter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocationName,
  onSelectLocation,
  onLocateMe,
  onRefresh,
  isLoading,
  alerts,
  onOpenNotificationCenter,
}) => {
  const { t, language, setLanguage, currentLanguageInfo } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { unit, toggleUnit } = useUnit();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [langCategoryTab, setLangCategoryTab] = useState<'all' | 'major_indian' | 'hindi_dialects'>('all');

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (
        langRef.current &&
        !langRef.current.contains(e.target as Node) &&
        mobileLangRef.current &&
        !mobileLangRef.current.contains(e.target as Node)
      ) {
        setIsLangOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced location search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  // Filter languages
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((item: LanguageInfo) => {
    if (langCategoryTab !== 'all' && item.category !== langCategoryTab) {
      return false;
    }
    if (!langSearch.trim()) return true;
    const term = langSearch.toLowerCase();
    return (
      item.label.toLowerCase().includes(term) ||
      item.nativeName.toLowerCase().includes(term) ||
      item.region.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term)
    );
  });

  const renderLanguageDropdown = () => (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[460px] flex flex-col glass-panel rounded-2xl p-3 shadow-2xl border border-cyan-500/20 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="pb-2 border-b border-slate-700/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-100">
              {t('indianLanguagesDialects', 'Indian Languages & Dialects')} ({SUPPORTED_LANGUAGES.length})
            </span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
            {t('indianBadge', '100% Indian')}
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={langSearch}
            onChange={(e) => setLangSearch(e.target.value)}
            placeholder={t('searchLangPlaceholder', 'Search language, state or script...')}
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all"
          />
          {langSearch && (
            <button
              onClick={() => setLangSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900/60 rounded-lg text-[10px]">
          <button
            onClick={() => setLangCategoryTab('all')}
            className={`flex-1 py-1 px-2 rounded-md font-medium transition-all ${
              langCategoryTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('allLanguages', 'All')} (33)
          </button>
          <button
            onClick={() => setLangCategoryTab('major_indian')}
            className={`flex-1 py-1 px-2 rounded-md font-medium transition-all ${
              langCategoryTab === 'major_indian'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('majorLanguages', 'Major')} (23)
          </button>
          <button
            onClick={() => setLangCategoryTab('hindi_dialects')}
            className={`flex-1 py-1 px-2 rounded-md font-medium transition-all ${
              langCategoryTab === 'hindi_dialects'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('dialectsTab', 'Dialects')} (10)
          </button>
        </div>
      </div>

      {/* Language List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1 max-h-[300px] pr-1">
        {filteredLanguages.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {t('noMatchingLanguages', 'No matching Indian languages found.')}
          </div>
        ) : (
          filteredLanguages.map((langItem) => {
            const isSelected = language === langItem.code;
            return (
              <button
                key={langItem.code}
                onClick={() => {
                  setLanguage(langItem.code as LanguageCode);
                  setIsLangOpen(false);
                  setLangSearch('');
                }}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{langItem.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-100 truncate">
                        {langItem.nativeName}
                      </span>
                      {langItem.category === 'hindi_dialects' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          {t('dialectBadge', 'Dialect')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      {langItem.label} • {langItem.region}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 w-full px-3 py-3 sm:px-6 sm:py-4 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        {/* Left: Brand Logo & AI LIVE Badge */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-indigo-500/20 border border-cyan-400/30 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <CloudSun className="w-6 h-6 text-cyan-400 animate-pulse-glow" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 font-['Space_Grotesk']">
                  Weather<span className="text-cyan-400">GPT</span>
                </span>
                <span
                  id="ai-live-badge"
                  className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
                  {t('aiLiveBadge', 'AI LIVE')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[170px] sm:max-w-[220px]">
                  {currentLocationName || 'Delhi, India'}
                </span>
              </p>
            </div>
          </div>

          {/* Mobile Right Controls Quick Row */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Language Button */}
            <div ref={mobileLangRef} className="relative">
              <button
                id="mobile-language-btn"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <span>{currentLanguageInfo.flag}</span>
                <span className="text-[10px] uppercase font-mono max-w-[50px] truncate">
                  {currentLanguageInfo.nativeName}
                </span>
              </button>

              {isLangOpen && renderLanguageDropdown()}
            </div>

            <button
              id="mobile-unit-btn"
              onClick={toggleUnit}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700"
            >
              °{unit}
            </button>
            <button
              id="mobile-locate-btn"
              onClick={onLocateMe}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-cyan-400 border border-slate-700"
              title={t('locateMe')}
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Search Bar with Autocomplete */}
        <div ref={searchRef} className="relative w-full md:max-w-md lg:max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="city-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={t('searchPlaceholder', 'Search city, state or pincode...')}
              className="w-full pl-10 pr-10 py-2 rounded-xl text-sm bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/80 border border-cyan-500/20 text-slate-100 dark:text-slate-100 light:text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 p-0.5 rounded-md hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown Popup */}
          {isSearchOpen && (
            <div
              id="search-results-dropdown"
              className="absolute left-0 right-0 top-full mt-2 glass-panel rounded-2xl p-2 shadow-2xl border border-cyan-500/20 z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {t('searchingStations', 'Searching meteorology stations...')}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('searchResults', 'Matching Locations')}
                  </div>
                  {searchResults.map((loc, idx) => (
                    <button
                      key={`${loc.name}-${loc.latitude}-${idx}`}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between text-xs text-slate-200 group"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-slate-100">{loc.name}</span>
                        <span className="text-slate-400 text-[11px]">
                          {loc.admin1 ? `${loc.admin1}, ` : ''}
                          {loc.country}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {t('noLocationsFound', 'No locations found matching')} "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{t('popularCities', 'Popular Indian Cities')}</span>
                    <span className="text-[9px] text-cyan-400 font-normal">{t('fastSelect', 'Fast Select')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {POPULAR_LOCATIONS.map((pop) => (
                      <button
                        key={pop.name}
                        onClick={() => handleSelectLocation(pop)}
                        className="text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors text-xs text-slate-300 hover:text-cyan-300 flex items-center gap-1.5"
                      >
                        <MapPin className="w-3 h-3 text-cyan-400/70" />
                        <span className="truncate">{pop.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Controls & Utility Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Locate Me Button */}
          <button
            id="locate-me-btn"
            onClick={onLocateMe}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 border border-slate-700/60 hover:border-cyan-400/40 transition-all active:scale-95"
            title={t('locateMe')}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('locateMe', 'Locate Me')}</span>
          </button>

          {/* Refresh Button */}
          <button
            id="refresh-weather-btn"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-400/40 transition-all disabled:opacity-50"
            title={t('refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Unit Toggle */}
          <button
            id="unit-toggle-btn"
            onClick={toggleUnit}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-cyan-400/40 transition-all"
            title="Toggle °C / °F"
          >
            <span className={unit === 'C' ? 'text-cyan-300 font-bold' : 'text-slate-400'}>°C</span>
            <span className="text-slate-600">/</span>
            <span className={unit === 'F' ? 'text-amber-300 font-bold' : 'text-slate-400'}>°F</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700/60 transition-all"
            title={isDark ? t('themeLight') : t('themeDark')}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div ref={langRef} className="relative">
            <button
              id="language-selector-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-cyan-400/40 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">{currentLanguageInfo.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangOpen && renderLanguageDropdown()}
          </div>

          {/* Notifications / Alerts Button */}
          <div ref={alertsRef} className="relative">
            <button
              id="notifications-btn"
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-700/60 transition-all"
              title={t('notifications', 'Notifications')}
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>

            {isAlertsOpen && (
              <div
                id="alerts-dropdown-menu"
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 glass-panel rounded-xl p-3 shadow-2xl border border-cyan-500/20 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/50 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {t('notifications', 'Weather Advisories')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {alerts.length} {t('activeAlertsCount', 'Active')}
                  </span>
                </div>

                {alerts.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {alerts.map((alert) => {
                      const locAlert = getLocalizedAlert(alert, t);
                      return (
                        <div
                          key={alert.id}
                          className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-500/30 text-xs"
                        >
                          <div className="font-semibold text-amber-300 flex items-center justify-between">
                            <span>{locAlert.title}</span>
                            <span className="text-[10px] text-slate-400">{locAlert.time}</span>
                          </div>
                          <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                            {locAlert.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    {t('noAlerts', 'No critical meteorological alerts at this moment.')}
                  </p>
                )}

                {onOpenNotificationCenter && (
                  <div className="pt-2.5 mt-2 border-t border-slate-700/50">
                    <button
                      onClick={() => {
                        setIsAlertsOpen(false);
                        onOpenNotificationCenter();
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 text-center transition-colors"
                    >
                      {t('openNotificationCenter', 'Open Central Notification System')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
