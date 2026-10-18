import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './i18n/context/LanguageContext';
import { UnitProvider } from './context/UnitContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/Header/Header';
import { FeatureSidebar } from './components/Sidebar/FeatureSidebar';
import { NotificationToast } from './components/Notifications/NotificationToast';
import { NotificationCenterModal } from './components/Notifications/NotificationCenterModal';

// Unique Features Views
import { WeatherAutopilot } from './components/UniqueFeatures/WeatherAutopilot';
import { RouteIntelligence } from './components/UniqueFeatures/RouteIntelligence';
import { WhatChanged } from './components/UniqueFeatures/WhatChanged';
import { WeatherHistory } from './components/UniqueFeatures/WeatherHistory';
import { DisasterAlerts } from './components/UniqueFeatures/DisasterAlerts';
import { UserAdvisory } from './components/UniqueFeatures/UserAdvisory';

// Main Dashboard Sections
import { WeatherHero } from './components/WeatherHero/WeatherHero';
import { WeatherIntelligence } from './components/WeatherMetrics/WeatherIntelligence';
import { HourlyForecast } from './components/HourlyForecast/HourlyForecast';
import { Forecast7Day } from './components/Forecast/Forecast7Day';
import { WeatherMap } from './components/weather/WeatherMap';
import { AIChat } from './components/AIChat/AIChat';
import { SmartAdvice } from './components/SmartAdvice/SmartAdvice';
import { WeatherSummaryAndComparison } from './components/WeatherSummary/WeatherSummaryAndComparison';
import { Footer } from './components/Footer/Footer';

import {
  fetchWeatherData,
  getMockDelhiWeather,
  generateWeatherAlerts,
  LocationSearchResult,
} from './services/weatherService';
import { WeatherData, ForecastDay, HourlyForecastItem, WeatherAlertItem } from './types/weather';
import { UniqueFeatureTab } from './types/uniqueFeatures';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

const WeatherDashboard: React.FC = () => {
  const { t } = useLanguage();

  // Active feature tab state (defaults to live dashboard)
  const [activeTab, setActiveTab] = useState<UniqueFeatureTab>('dashboard');
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Sidebar collapsible state with persistent local storage
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weathergpt_sidebar_open');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return true;
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('weathergpt_sidebar_open', String(next));
      }
      return next;
    });
  };

  // Initial State from fallback Delhi
  const initial = getMockDelhiWeather();
  const [weather, setWeather] = useState<WeatherData>(initial.weather);
  const [forecast, setForecast] = useState<ForecastDay[]>(initial.forecast);
  const [hourly, setHourly] = useState<HourlyForecastItem[]>(initial.hourly || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load weather for a given coordinate
  const loadWeatherForCoords = useCallback(
    async (lat: number, lon: number, cityName: string, countryName: string, stateName?: string) => {
      setIsLoading(true);
      setLocationError(null);
      try {
        const data = await fetchWeatherData(lat, lon, cityName, countryName, stateName);
        setWeather(data.weather);
        setForecast(data.forecast);
        setHourly(data.hourly);
      } catch (err: any) {
        console.error('Error fetching weather:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Reset scroll position to the top on page refresh/reload and disable browser auto-scroll restoration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    loadWeatherForCoords(28.6139, 77.209, 'Delhi', 'India', 'Delhi');
  }, [loadWeatherForCoords]);

  // Handle Location Selection from Search dropdown
  const handleSelectLocation = (loc: LocationSearchResult) => {
    loadWeatherForCoords(loc.latitude, loc.longitude, loc.name, loc.country, loc.admin1);
  };

  // Handle Locate Me (Geolocation API)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError(t('geoNotSupported', 'Geolocation is not supported by your current browser.'));
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          let cityName = 'My Location';
          let countryName = '';
          let stateName = '';

          if (res.ok) {
            const geoData = await res.json();
            cityName = geoData.city || geoData.locality || geoData.principalSubdivision || 'My Location';
            countryName = geoData.countryName || '';
            stateName = geoData.principalSubdivision || '';
          }

          await loadWeatherForCoords(latitude, longitude, cityName, countryName, stateName);
        } catch (err) {
          await loadWeatherForCoords(latitude, longitude, 'Local Station', '', '');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError(t('locationDenied', t('geoPermissionDenied', 'Location access was denied. Please allow location permissions in your browser.')));
        } else {
          setLocationError(t('locationFailed', t('geoFailed', 'Unable to retrieve your current location. Please try searching for your city.')));
        }
      },
      { timeout: 10000 }
    );
  };

  // Handle Refresh
  const handleRefresh = () => {
    loadWeatherForCoords(weather.lat, weather.lon, weather.city, weather.country, weather.state);
  };

  // Compute active alerts
  const alerts: WeatherAlertItem[] = generateWeatherAlerts(
    weather.temperature,
    weather.rainChance,
    weather.aqi,
    weather.uvIndex,
    weather.windSpeed
  );

  const tomorrowForecast = forecast.length > 1 ? forecast[1] : undefined;

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans transition-colors duration-300 relative selection:bg-cyan-500 selection:text-black">
      {/* Ambient background glow orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <Header
        currentLocationName={weather.location}
        onSelectLocation={handleSelectLocation}
        onLocateMe={handleLocateMe}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        alerts={alerts}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
      />

      {/* Toast Notification Layer */}
      <NotificationToast onSelectFeature={(tab) => setActiveTab(tab)} />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onSelectFeature={(tab) => setActiveTab(tab)}
      />

      {/* Main Container Layout with Left Unique Features Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
              : 'flex flex-col gap-4 items-start'
          }`}
        >
          {/* LEFT SIDEBAR: Positioned directly below logo area */}
          <div
            className={`z-20 transition-all duration-300 ${
              isSidebarOpen
                ? 'lg:col-span-3 xl:col-span-3 lg:sticky lg:top-24 w-full'
                : 'w-auto self-start'
            }`}
          >
            <FeatureSidebar
              isOpen={isSidebarOpen}
              onToggle={handleToggleSidebar}
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>

          {/* MAIN VIEWPORT: Features Content or Full Live Dashboard */}
          <main
            className={`space-y-8 min-w-0 transition-all duration-300 ${
              isSidebarOpen ? 'lg:col-span-9 xl:col-span-9 w-full' : 'w-full'
            }`}
          >
            {/* Loading overlay indicator banner */}
            {isLoading && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{t('syncTelemetry', t('synchronizingTelemetry', 'Synchronizing live atmospheric telemetry...'))}</span>
              </div>
            )}

            {/* Render Selected View */}
            {activeTab === 'autopilot' && (
              <WeatherAutopilot
                currentWeather={weather}
                forecast={forecast}
                hourlyForecast={hourly}
              />
            )}

            {activeTab === 'route' && (
              <RouteIntelligence currentWeather={weather} />
            )}

            {activeTab === 'what_changed' && (
              <WhatChanged currentWeather={weather} hourlyForecast={hourly} />
            )}

            {activeTab === 'history' && (
              <WeatherHistory currentWeather={weather} />
            )}

            {activeTab === 'disasters' && (
              <DisasterAlerts currentWeather={weather} />
            )}

            {activeTab === 'advisory' && (
              <UserAdvisory currentWeather={weather} forecast={forecast} />
            )}

            {/* FULL LIVE DASHBOARD (DEFAULT VIEW) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* 1. Weather Hero */}
                <WeatherHero weather={weather} />

                {/* 2. Weather Intelligence (8-Metric Grid) */}
                <WeatherIntelligence weather={weather} />

                {/* Hourly Forecast */}
                <HourlyForecast hourly={hourly} weather={weather} isLoading={isLoading} />

                {/* 3. 7-Day Forecast */}
                <Forecast7Day forecast={forecast} weather={weather} />

                {/* 4. Interactive Weather Map (All 4 Distinct Layers) */}
                <WeatherMap
                  weather={weather}
                  onLocateMe={handleLocateMe}
                  isLocating={isLocating}
                  locationError={locationError}
                />

                {/* 5. AI Weather Assistant */}
                <AIChat weather={weather} />

                {/* 6. Smart Advice */}
                <SmartAdvice weather={weather} />

                {/* 7. AI Summary & Comparison */}
                <WeatherSummaryAndComparison weather={weather} tomorrow={tomorrowForecast} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UnitProvider>
          <NotificationProvider>
            <WeatherDashboard />
          </NotificationProvider>
        </UnitProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
