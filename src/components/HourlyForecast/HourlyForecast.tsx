import React, { useState, useRef, useMemo } from 'react';
import {
  Clock,
  LineChart as LineChartIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind,
  Sun,
  Activity,
  Gauge,
  Eye,
  Thermometer,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { HourlyForecastItem, WeatherData } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useUnit } from '../../context/UnitContext';
import { AnimatedWeatherIcon } from '../WeatherHero/AnimatedWeatherIcon';
import { translateCondition, translateWindDirection } from '../../i18n/utils';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  weather: WeatherData;
  isLoading?: boolean;
}

type ViewMode = 'normal' | 'graph';
type MetricKey =
  | 'temperature'
  | 'rainChance'
  | 'windSpeed'
  | 'humidity'
  | 'uvIndex'
  | 'aqi'
  | 'feelsLike'
  | 'pressure'
  | 'visibility';

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  weather,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const { unit, formatTemp } = useUnit();

  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('temperature');
  const [selectedHourId, setSelectedHourId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll carousel left / right
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // 24-hour summary stats
  const stats = useMemo(() => {
    if (!hourly || hourly.length === 0) {
      return { maxTemp: 0, minTemp: 0, maxRain: 0, maxWind: 0, avgAqi: 0 };
    }
    const temps = hourly.map((h) => h.temperature);
    const rains = hourly.map((h) => h.rainChance);
    const winds = hourly.map((h) => h.windSpeed);
    const aqis = hourly.map((h) => h.aqi || 0);

    return {
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      maxRain: Math.max(...rains),
      maxWind: Math.max(...winds),
      avgAqi: Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length),
    };
  }, [hourly]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return (hourly || []).map((item, index) => {
      // In Fahrenheit mode, convert temperature & feelsLike for graphing
      const displayTemp = unit === 'F' ? Math.round((item.temperature * 9) / 5 + 32) : item.temperature;
      const displayFeelsLike =
        unit === 'F' ? Math.round((item.feelsLike * 9) / 5 + 32) : item.feelsLike;

      return {
        id: item.id,
        index,
        rawHour: item.hour,
        time: item.time,
        fullTime: item.fullTime,
        date: item.date,
        condition: translateCondition(item.condition, t),
        iconCode: item.iconCode,
        isDay: item.isDay,
        temperature: displayTemp,
        feelsLike: displayFeelsLike,
        rainChance: item.rainChance,
        precipitation: item.precipitation,
        windSpeed: item.windSpeed,
        windDirection: translateWindDirection(item.windDirection, t),
        humidity: item.humidity,
        uvIndex: item.uvIndex,
        aqi: item.aqi || 0,
        aqiCategory: item.aqiCategory || 'Moderate',
        pressure: item.pressure,
        visibility: item.visibility,
      };
    });
  }, [hourly, unit, t]);

  // Metric configs for Graph View
  const metricConfigs: Record<
    MetricKey,
    {
      label: string;
      unitLabel: string;
      color: string;
      strokeColor: string;
      gradientId: string;
      icon: React.ElementType;
      minDomain?: number | string;
      maxDomain?: number | string;
      tooltipFormat: (val: number) => string;
    }
  > = {
    temperature: {
      label: t('hourlyMetricTemp', 'Temperature'),
      unitLabel: unit === 'F' ? '°F' : '°C',
      color: '#38bdf8',
      strokeColor: '#0ea5e9',
      gradientId: 'tempGradient',
      icon: Thermometer,
      minDomain: 'dataMin - 2',
      maxDomain: 'dataMax + 2',
      tooltipFormat: (v) => `${v}°${unit}`,
    },
    rainChance: {
      label: t('hourlyMetricRain', 'Rain Chance'),
      unitLabel: '%',
      color: '#60a5fa',
      strokeColor: '#3b82f6',
      gradientId: 'rainGradient',
      icon: Droplets,
      minDomain: 0,
      maxDomain: 100,
      tooltipFormat: (v) => `${v}%`,
    },
    windSpeed: {
      label: t('hourlyMetricWind', 'Wind Speed'),
      unitLabel: 'km/h',
      color: '#2dd4bf',
      strokeColor: '#14b8a6',
      gradientId: 'windGradient',
      icon: Wind,
      minDomain: 0,
      maxDomain: 'dataMax + 5',
      tooltipFormat: (v) => `${v} km/h`,
    },
    humidity: {
      label: t('hourlyMetricHumidity', 'Humidity'),
      unitLabel: '%',
      color: '#818cf8',
      strokeColor: '#6366f1',
      gradientId: 'humidityGradient',
      icon: Droplets,
      minDomain: 0,
      maxDomain: 100,
      tooltipFormat: (v) => `${v}%`,
    },
    uvIndex: {
      label: t('hourlyMetricUv', 'UV Index'),
      unitLabel: 'UV',
      color: '#fbbf24',
      strokeColor: '#f59e0b',
      gradientId: 'uvGradient',
      icon: Sun,
      minDomain: 0,
      maxDomain: 12,
      tooltipFormat: (v) => `${v} UV`,
    },
    aqi: {
      label: t('hourlyMetricAqi', 'Air Quality (AQI)'),
      unitLabel: 'AQI',
      color: '#c084fc',
      strokeColor: '#a855f7',
      gradientId: 'aqiGradient',
      icon: Activity,
      minDomain: 0,
      maxDomain: 'dataMax + 20',
      tooltipFormat: (v) => `AQI ${v}`,
    },
    feelsLike: {
      label: t('hourlyMetricFeelsLike', 'Feels Like'),
      unitLabel: unit === 'F' ? '°F' : '°C',
      color: '#fb923c',
      strokeColor: '#f97316',
      gradientId: 'feelsLikeGradient',
      icon: Thermometer,
      minDomain: 'dataMin - 2',
      maxDomain: 'dataMax + 2',
      tooltipFormat: (v) => `${v}°${unit}`,
    },
    pressure: {
      label: t('hourlyMetricPressure', 'Pressure'),
      unitLabel: 'hPa',
      color: '#94a3b8',
      strokeColor: '#64748b',
      gradientId: 'pressureGradient',
      icon: Gauge,
      minDomain: 'dataMin - 4',
      maxDomain: 'dataMax + 4',
      tooltipFormat: (v) => `${v} hPa`,
    },
    visibility: {
      label: t('hourlyMetricVisibility', 'Visibility'),
      unitLabel: 'km',
      color: '#34d399',
      strokeColor: '#10b981',
      gradientId: 'visibilityGradient',
      icon: Eye,
      minDomain: 0,
      maxDomain: 15,
      tooltipFormat: (v) => `${v} km`,
    },
  };

  const activeConfig = metricConfigs[selectedMetric];

  // Helper for UV Badge Color
  const getUvBadge = (uv: number) => {
    if (uv <= 2) return { text: t('uvLow', 'Low'), color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (uv <= 5) return { text: t('uvModerate', 'Mod'), color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    if (uv <= 7) return { text: t('uvHigh', 'High'), color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    return { text: t('uvVeryHigh', 'Very High'), color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  // Helper for AQI Badge Color
  const getAqiBadge = (aqi: number) => {
    if (aqi <= 50) return { text: t('aqiGood', 'Good'), color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (aqi <= 100) return { text: t('aqiModerate', 'Moderate'), color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    if (aqi <= 200) return { text: t('aqiPoor', 'Poor'), color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    return { text: t('aqiSevere', 'Severe'), color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  return (
    <section id="hourly-forecast-section" className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-1">
        <div>
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-['Space_Grotesk'] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('hourlyForecastTitle', 'HOURLY FORECAST')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Space_Grotesk'] tracking-tight">
            {t('hourlyForecast', 'Hourly Forecast')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('hourlyOutlook', 'Detailed 24-hour meteorological telemetry & visual trend curves')}
          </p>
        </div>

        {/* View Switcher & Quick Location Pill */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* 24h Summary Stats Pills (Responsive) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
            <span className="text-cyan-400 font-medium">{t('high', 'High')}: <strong className="text-slate-100">{formatTemp(stats.maxTemp)}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 font-medium">{t('low', 'Low')}: <strong className="text-slate-100">{formatTemp(stats.minTemp)}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-300 font-medium">{t('rain', 'Rain')}: <strong className="text-slate-100">{stats.maxRain}%</strong></span>
          </div>

          {/* View Mode Toggle Button */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
            <button
              id="hourly-view-normal-btn"
              type="button"
              onClick={() => setViewMode('normal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                viewMode === 'normal'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t('normalView', 'Normal View')}</span>
            </button>

            <button
              id="hourly-view-graph-btn"
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                viewMode === 'graph'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>{t('graphView', 'Graph View')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cyan-500/15 relative overflow-hidden">
        {/* VIEW 1: NORMAL VIEW (Horizontal Scrollable Carousel Cards) */}
        {viewMode === 'normal' && (
          <div className="space-y-4">
            {/* Scroll Navigation Header Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {t('scrollForMore', 'Scroll horizontally or use arrow buttons to explore 24 hours')}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  id="hourly-scroll-left-btn"
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => handleScroll('left')}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="hourly-scroll-right-btn"
                  type="button"
                  aria-label="Scroll right"
                  onClick={() => handleScroll('right')}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Cards Track */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar focus:outline-none"
              tabIndex={0}
            >
              {hourly.map((item, idx) => {
                const isNow = idx === 0;
                const isSelected = selectedHourId === item.id;
                const uvBadge = getUvBadge(item.uvIndex);
                const aqiBadge = getAqiBadge(item.aqi || 100);

                return (
                  <div
                    key={item.id}
                    id={`hourly-card-${idx}`}
                    onClick={() => setSelectedHourId(isSelected ? null : item.id)}
                    className={`flex-shrink-0 w-[145px] sm:w-[160px] p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer border flex flex-col justify-between group ${
                      isNow
                        ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : isSelected
                        ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-cyan-500/30'
                    }`}
                  >
                    {/* Card Top: Time & Now Badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-100 font-['Space_Grotesk'] flex items-center gap-1">
                          {item.time === 'Now' ? t('now', 'Now') : item.time}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {item.date}
                        </div>
                      </div>
                      {isNow && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-cyan-500 text-slate-950 uppercase tracking-wider animate-pulse">
                          {t('live', 'LIVE')}
                        </span>
                      )}
                    </div>

                    {/* Weather Icon & Condition */}
                    <div className="my-3 flex flex-col items-center justify-center text-center">
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        <AnimatedWeatherIcon iconCode={item.iconCode} condition={item.condition} size="md" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-300 mt-1 line-clamp-1">
                        {translateCondition(item.condition, t)}
                      </span>
                    </div>

                    {/* Temperature & Feels Like */}
                    <div className="text-center mb-3">
                      <div className="text-2xl font-black text-slate-100 font-['Space_Grotesk'] tracking-tight">
                        {formatTemp(item.temperature)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {t('feelsLike', 'Feels')}: {formatTemp(item.feelsLike)}
                      </div>
                    </div>

                    {/* Detailed Metric Badges */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/70 text-[11px]">
                      {/* Rain Probability */}
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Droplets className="w-3 h-3 text-blue-400" />
                          <span>{t('rain', 'Rain')}</span>
                        </span>
                        <span className={`font-semibold ${item.rainChance > 40 ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>
                          {item.rainChance}%
                        </span>
                      </div>

                      {/* Wind Speed & Direction */}
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Wind className="w-3 h-3 text-cyan-400" />
                          <span>{t('wind', 'Wind')}</span>
                        </span>
                        <span className="font-semibold text-slate-200">
                          {item.windSpeed} <span className="text-[9px] text-slate-400">{translateWindDirection(item.windDirection, t)}</span>
                        </span>
                      </div>

                      {/* Humidity */}
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Droplets className="w-3 h-3 text-teal-400" />
                          <span>{t('humidity', 'Humidity')}</span>
                        </span>
                        <span className="font-semibold text-slate-200">
                          {item.humidity}%
                        </span>
                      </div>

                      {/* UV Index Badge */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Sun className="w-3 h-3 text-amber-400" />
                          <span>{t('uvIndex', 'UV')}</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${uvBadge.color}`}>
                          {item.uvIndex} ({uvBadge.text})
                        </span>
                      </div>

                      {/* Air Quality AQI Badge */}
                      {item.aqi != null && (
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Activity className="w-3 h-3 text-purple-400" />
                            <span>{t('airQuality', 'AQI')}</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${aqiBadge.color}`}>
                            {item.aqi}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: GRAPH VIEW (Interactive Recharts Curve with Metric Selectors) */}
        {viewMode === 'graph' && (
          <div className="space-y-5">
            {/* Metric Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(Object.keys(metricConfigs) as MetricKey[]).map((mKey) => {
                const config = metricConfigs[mKey];
                const IconComponent = config.icon;
                const isActive = selectedMetric === mKey;

                return (
                  <button
                    key={mKey}
                    id={`metric-btn-${mKey}`}
                    type="button"
                    onClick={() => setSelectedMetric(mKey)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" style={{ color: isActive ? config.color : undefined }} />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Graph Canvas */}
            <div className="w-full h-[280px] sm:h-[320px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={activeConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[activeConfig.minDomain ?? 'auto', activeConfig.maxDomain ?? 'auto']}
                    unit={activeConfig.unitLabel === '°C' || activeConfig.unitLabel === '°F' ? '°' : ''}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-slate-900/95 border border-cyan-500/30 backdrop-blur-md shadow-xl text-slate-100 text-xs space-y-1.5 min-w-[170px]">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-['Space_Grotesk']">
                              <span className="font-bold text-cyan-300">{d.time}</span>
                              <span className="text-[10px] text-slate-400">{d.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AnimatedWeatherIcon iconCode={d.iconCode} condition={d.condition} size="sm" />
                              <span className="font-medium text-slate-200">{d.condition}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold pt-0.5">
                              <span className="text-slate-400">{activeConfig.label}:</span>
                              <span className="text-cyan-400 font-bold font-['Space_Grotesk'] text-sm">
                                {activeConfig.tooltipFormat(d[selectedMetric])}
                              </span>
                            </div>
                            {selectedMetric !== 'temperature' && (
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>{t('hourlyMetricTemp', 'Temp')}:</span>
                                <span className="text-slate-200 font-semibold">{formatTemp(d.temperature)}</span>
                              </div>
                            )}
                            {selectedMetric !== 'rainChance' && (
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>{t('rain', 'Rain')}:</span>
                                <span className="text-blue-300 font-semibold">{d.rainChance}%</span>
                              </div>
                            )}
                            {selectedMetric !== 'windSpeed' && (
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>{t('wind', 'Wind')}:</span>
                                <span className="text-slate-200">{d.windSpeed} km/h {d.windDirection}</span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={activeConfig.strokeColor}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#${activeConfig.gradientId})`}
                    activeDot={{
                      r: 6,
                      stroke: activeConfig.color,
                      strokeWidth: 2,
                      fill: '#070d1e',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Metric Deep-Dive Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('high', 'Peak 24h')}
                </div>
                <div className="text-lg font-bold text-slate-100 font-['Space_Grotesk'] mt-0.5">
                  {selectedMetric === 'temperature'
                    ? formatTemp(stats.maxTemp)
                    : selectedMetric === 'rainChance'
                    ? `${stats.maxRain}%`
                    : selectedMetric === 'windSpeed'
                    ? `${stats.maxWind} km/h`
                    : activeConfig.tooltipFormat(
                        Math.max(...chartData.map((d: any) => d[selectedMetric] || 0))
                      )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('low', 'Lowest 24h')}
                </div>
                <div className="text-lg font-bold text-slate-100 font-['Space_Grotesk'] mt-0.5">
                  {selectedMetric === 'temperature'
                    ? formatTemp(stats.minTemp)
                    : activeConfig.tooltipFormat(
                        Math.min(...chartData.map((d: any) => d[selectedMetric] || 0))
                      )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('currentConditions', 'Current Value')}
                </div>
                <div className="text-lg font-bold text-cyan-400 font-['Space_Grotesk'] mt-0.5">
                  {chartData[0] ? activeConfig.tooltipFormat(chartData[0][selectedMetric]) : '--'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t('forecastOutlook', 'Trend')}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>
                    {chartData.length > 6 && chartData[6][selectedMetric] > (chartData[0]?.[selectedMetric] ?? 0)
                      ? t('rising', 'Rising')
                      : t('steady', 'Stable / Fluctuating')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
