import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRightLeft,
  Thermometer,
  CloudRain,
  Wind,
  Activity,
  AlertTriangle,
  Flame,
  SunMedium,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { WeatherData, ForecastDay, WeatherAlertItem } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useUnit } from '../../context/UnitContext';
import { generateComparison, generateWeatherAlerts } from '../../services/weatherService';
import { fetchDailySummary } from '../../services/aiService';
import {
  getLocalizedAlert,
  getLocalizedComparisonText,
  getLocalizedFallbackSummary,
} from '../../i18n/utils';

interface WeatherSummaryAndComparisonProps {
  weather: WeatherData;
  tomorrow: ForecastDay | undefined;
}

export const WeatherSummaryAndComparison: React.FC<WeatherSummaryAndComparisonProps> = ({
  weather,
  tomorrow,
}) => {
  const { t, language } = useLanguage();
  const { formatTemp } = useUnit();

  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  // Fetch or generate AI summary when weather or language changes
  useEffect(() => {
    let isMounted = true;
    setLoadingSummary(true);

    fetchDailySummary(weather, language)
      .then((summary) => {
        if (isMounted) {
          setAiSummary(summary);
          setLoadingSummary(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingSummary(false);
      });

    return () => {
      isMounted = false;
    };
  }, [weather.city, weather.temperature, language]);

  const comparison = tomorrow ? generateComparison(weather, tomorrow) : null;
  const alerts: WeatherAlertItem[] = generateWeatherAlerts(
    weather.temperature,
    weather.rainChance,
    weather.aqi,
    weather.uvIndex,
    weather.windSpeed
  );

  return (
    <section id="weather-summary-comparison-section" className="w-full space-y-6">
      {/* 1. Weather Alerts Section (if any alerts) */}
      {alerts.length > 0 && (
        <div id="weather-alerts-container" className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-['Space_Grotesk']">
              {t('activeAdvisories', 'Active Meteorological Advisories')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {alerts.map((alert) => {
              const locAlert = getLocalizedAlert(alert, t);
              return (
                <div
                  key={alert.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-start gap-3.5 shadow-lg relative overflow-hidden"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                    {alert.icon === 'Flame' ? (
                      <Flame className="w-5 h-5" />
                    ) : alert.icon === 'SunMedium' ? (
                      <SunMedium className="w-5 h-5" />
                    ) : alert.icon === 'CloudRain' ? (
                      <CloudRain className="w-5 h-5" />
                    ) : (
                      <Wind className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-amber-200">{locAlert.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{locAlert.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{locAlert.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AI Weather Summary & Today vs Tomorrow Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Weather Summary */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-cyan-500/20 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-400/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-['Space_Grotesk']">
                    {t('weatherSummaryTitle', 'AI WEATHER OUTLOOK')}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
                    {t('weatherSummarySubtitle', 'Daily Intelligence Digest')}
                  </h3>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Gemini 2.5
              </span>
            </div>

            <div className="mt-4">
              {loadingSummary ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-cyan-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{t('synthesizingOutlook', 'Synthesizing atmospheric outlook...')}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {aiSummary || getLocalizedFallbackSummary(weather, t, formatTemp)}
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{t('location', 'Location')}: {weather.city}, {weather.country}</span>
            <span className="text-cyan-400 font-semibold">{t('lastUpdated', 'Updated just now')}</span>
          </div>
        </div>

        {/* Right: Today vs Tomorrow Comparison */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-cyan-500/20 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-400/30">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-['Space_Grotesk']">
                  {t('todayVsTomorrowTitle', 'METEOROLOGICAL COMPARISON')}
                </div>
                <h3 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
                  {t('todayVsTomorrowSubtitle', 'Today vs Tomorrow')}
                </h3>
              </div>
            </div>

            {comparison && tomorrow && (
              <div className="mt-4 space-y-2.5">
                {/* Temp Comparison */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Thermometer className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{getLocalizedComparisonText('temp', weather, tomorrow, t)}</span>
                  </div>
                  <span className="font-bold text-slate-100 font-mono shrink-0">
                    {formatTemp(weather.tempMax)} → {formatTemp(tomorrow.tempMax)}
                  </span>
                </div>

                {/* Rain Comparison */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CloudRain className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{getLocalizedComparisonText('rain', weather, tomorrow, t)}</span>
                  </div>
                  <span className="font-bold text-blue-300 font-mono shrink-0">
                    {weather.rainChance}% → {tomorrow.rainChance}%
                  </span>
                </div>

                {/* Wind Comparison */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Wind className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{getLocalizedComparisonText('wind', weather, tomorrow, t)}</span>
                  </div>
                  <span className="font-bold text-sky-300 font-mono shrink-0">
                    {weather.windSpeed} → {tomorrow.windSpeed} km/h
                  </span>
                </div>

                {/* AQI Comparison */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{getLocalizedComparisonText('aqi', weather, tomorrow, t)}</span>
                  </div>
                  <span className="font-bold text-slate-100 font-mono shrink-0">
                    AQI {weather.aqi} → {tomorrow.aqi}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{t('ensembleCalculated', 'Calculated from multi-model ensemble')}</span>
            <span className="text-emerald-400 font-medium">{t('confidenceHigh', 'Confidence: High')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
