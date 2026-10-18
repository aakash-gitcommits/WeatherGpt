import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Droplets,
  Wind,
  Sun,
  Activity,
  Sunset,
  Thermometer,
} from 'lucide-react';
import { ForecastDay, WeatherData } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useUnit } from '../../context/UnitContext';
import { AnimatedWeatherIcon } from '../WeatherHero/AnimatedWeatherIcon';
import { translateCondition, translateDayName, translateStatus } from '../../i18n/utils';

interface Forecast7DayProps {
  forecast: ForecastDay[];
  weather: WeatherData;
}

export const Forecast7Day: React.FC<Forecast7DayProps> = ({ forecast, weather }) => {
  const { t } = useLanguage();
  const { formatTemp } = useUnit();

  // State: expanded forecast day ID (only one open at a time)
  const [expandedId, setExpandedId] = useState<string | null>(forecast[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Find min & max across 7 days for relative progress bar scaling
  const allMin = Math.min(...forecast.map((d) => d.tempMin));
  const allMax = Math.max(...forecast.map((d) => d.tempMax));
  const totalSpan = Math.max(1, allMax - allMin);

  return (
    <section id="weather-forecast-section" className="w-full space-y-4">
      {/* Forecast Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-['Space_Grotesk']">
            {t('weatherForecast', 'WEATHER FORECAST')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Space_Grotesk']">
            {t('sevenDayForecast', '7-Day Forecast')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('forecastOutlook', 'Weather outlook for selected location')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-xs text-cyan-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{weather.city}, {weather.country}</span>
        </div>
      </div>

      {/* 7 Forecast Rows Container */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-cyan-500/15 p-2 sm:p-4 space-y-2 shadow-xl">
        {forecast.map((item, idx) => {
          const isExpanded = expandedId === item.id;

          // Calculate bar position
          const leftPercent = Math.max(0, ((item.tempMin - allMin) / totalSpan) * 100);
          const widthPercent = Math.max(12, ((item.tempMax - item.tempMin) / totalSpan) * 100);

          // Translate day labels accurately
          const dayDisplay = translateDayName(item.day, t);

          return (
            <div
              key={item.id}
              id={`forecast-row-${idx}`}
              className={`rounded-2xl transition-all duration-300 border ${
                isExpanded
                  ? 'bg-slate-900/90 border-cyan-400/40 shadow-lg'
                  : 'bg-slate-900/40 hover:bg-slate-855 border-slate-800/80 hover:border-cyan-500/20'
              }`}
            >
              {/* Main Collapsed Row */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
              >
                {/* Day & Date */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                    <AnimatedWeatherIcon iconCode={item.iconCode} size="sm" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>{dayDisplay}</span>
                      {idx === 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-normal">
                          {t('live', 'Live')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{item.date}</div>
                  </div>
                </div>

                {/* Weather Condition & Rain */}
                <div className="flex items-center gap-4 min-w-[160px]">
                  <span className="text-xs sm:text-sm font-medium text-slate-300 truncate max-w-[110px]">
                    {translateCondition(item.condition, t)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-blue-400">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{item.rainChance}%</span>
                  </div>
                </div>

                {/* Temperature Range & Bar */}
                <div className="flex items-center gap-3 flex-1 max-w-sm">
                  <span className="text-xs font-semibold text-slate-400 w-10 text-right">
                    {formatTemp(item.tempMin)}
                  </span>

                  {/* Progress Range Bar */}
                  <div className="relative flex-1 h-2 rounded-full bg-slate-800/90 overflow-hidden border border-slate-700/40">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-100 w-10">
                    {formatTemp(item.tempMax)}
                  </span>
                </div>

                {/* Wind & Expand Toggle */}
                <div className="flex items-center justify-between md:justify-end gap-3 min-w-[120px]">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>{item.windSpeed} {t('windSpeedUnit', 'km/h')}</span>
                  </div>

                  <button
                    id={`forecast-expand-btn-${idx}`}
                    aria-label={`Expand forecast for ${item.day}`}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isExpanded
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Forecast Details Section (Smooth Animated Grid) */}
              {isExpanded && (
                <div
                  id={`forecast-details-${idx}`}
                  className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {/* Feels Like */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      {t('feelsLike', 'Feels Like')}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-100 mt-1 font-['Space_Grotesk']">
                      {formatTemp(item.feelsLike)}
                    </span>
                  </div>

                  {/* Humidity */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      {t('humidity', 'Humidity')}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-100 mt-1 font-['Space_Grotesk']">
                      {item.humidity}%
                    </span>
                  </div>

                  {/* Wind */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Wind className="w-3 h-3 text-sky-400" />
                      {t('wind', 'Wind')}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-100 mt-1 font-['Space_Grotesk']">
                      {item.windSpeed} {t('windSpeedUnit', 'km/h')}
                    </span>
                  </div>

                  {/* UV Index */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400" />
                      {t('uvIndex', 'UV Index')}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-amber-300 mt-1 font-['Space_Grotesk']">
                      {item.uvIndex}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({translateStatus(item.uvStatus, t)})
                      </span>
                    </span>
                  </div>

                  {/* Air Quality */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      {t('airQuality', 'Air Quality')}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-100 mt-1 font-['Space_Grotesk']">
                      AQI {item.aqi}
                    </span>
                  </div>

                  {/* Sunset */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sunset className="w-3 h-3 text-amber-400" />
                      {t('sunset', 'Sunset')}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-100 mt-1 font-['Space_Grotesk']">
                      {item.sunset}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
