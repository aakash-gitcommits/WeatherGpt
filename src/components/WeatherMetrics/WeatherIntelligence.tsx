import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Sun,
  Eye,
  CloudRain,
  Sunrise,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { translateStatus, translateWindDirection } from '../../i18n/utils';

interface WeatherIntelligenceProps {
  weather: WeatherData;
}

export const WeatherIntelligence: React.FC<WeatherIntelligenceProps> = ({ weather }) => {
  const { t } = useLanguage();

  const getStatusColor = (statusText: string) => {
    const s = statusText.toLowerCase();
    if (s.includes('good') || s.includes('normal') || s.includes('stable') || s.includes('gentle') || s.includes('low') || s.includes('उत्तम') || s.includes('सामान्य') || s.includes('स्थिर') || s.includes('कम')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s.includes('moderate') || s.includes('breezy') || s.includes('dry') || s.includes('humid') || s.includes('मध्यम') || s.includes('नम') || s.includes('शुष्क')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (s.includes('poor') || s.includes('high') || s.includes('strong') || s.includes('severe') || s.includes('very high') || s.includes('खराब') || s.includes('गंभीर') || s.includes('अधिक') || s.includes('तेज')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  };

  const metrics = [
    {
      id: 'metric-humidity',
      title: t('humidity', 'HUMIDITY'),
      value: `${weather.humidity}`,
      unit: '%',
      status: translateStatus(weather.humidityStatus, t),
      icon: Droplets,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      subtitle: weather.humidity > 70 ? t('highMoisture', 'High moisture') : t('comfortableBalance', 'Comfortable balance'),
    },
    {
      id: 'metric-wind',
      title: t('wind', 'WIND'),
      value: `${weather.windSpeed}`,
      unit: t('windSpeedUnit', 'km/h'),
      status: translateStatus(weather.windStatus, t),
      icon: Wind,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10',
      subtitle: `${t('direction', 'Direction')}: ${translateWindDirection(weather.windDirection, t)} (${weather.windDegree}°)`,
    },
    {
      id: 'metric-pressure',
      title: t('pressure', 'PRESSURE'),
      value: `${weather.pressure}`,
      unit: 'hPa',
      status: translateStatus(weather.pressureStatus, t),
      icon: Gauge,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      subtitle: t('barometricSeaLevel', 'Barometric Sea Level'),
    },
    {
      id: 'metric-uv',
      title: t('uvIndex', 'UV INDEX'),
      value: `${weather.uvIndex}`,
      unit: '/ 12',
      status: translateStatus(weather.uvStatus, t),
      icon: Sun,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      subtitle: weather.uvIndex >= 6 ? t('sunProtectionAdvised', 'Sun protection advised') : t('safeSolarExposure', 'Safe solar exposure'),
    },
    {
      id: 'metric-visibility',
      title: t('visibility', 'VISIBILITY'),
      value: `${weather.visibility}`,
      unit: 'km',
      status: translateStatus(weather.visibilityStatus, t),
      icon: Eye,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10',
      subtitle: t('clearHorizonLine', 'Clear horizon line'),
    },
    {
      id: 'metric-rain-chance',
      title: t('rainChanceCard', 'RAIN CHANCE'),
      value: `${weather.rainChance}`,
      unit: '%',
      status: translateStatus(weather.rainStatus, t),
      icon: CloudRain,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      subtitle: t('radarProbabilityIndex', 'Radar probability index'),
    },
    {
      id: 'metric-sun-cycle',
      title: t('sunCycle', 'SUN CYCLE'),
      value: weather.dayLength || `${weather.sunrise} - ${weather.sunset}`,
      unit: '',
      status: `${t('sunset', 'Sunset')}: ${weather.sunset}`,
      icon: Sunrise,
      iconColor: 'text-amber-300',
      iconBg: 'bg-amber-500/10',
      subtitle: `${t('sunrise', 'Sunrise')}: ${weather.sunrise}`,
    },
    {
      id: 'metric-aqi',
      title: t('airQuality', 'AIR QUALITY'),
      value: `AQI ${weather.aqi}`,
      unit: '',
      status: translateStatus(weather.aqiStatus, t),
      icon: Activity,
      iconColor: weather.aqi > 150 ? 'text-rose-400' : weather.aqi > 100 ? 'text-amber-400' : 'text-emerald-400',
      iconBg: weather.aqi > 150 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
      subtitle: t('pmSensors', 'PM2.5 & PM10 Sensors'),
    },
  ];

  return (
    <section id="weather-intelligence-section" className="w-full space-y-4">
      {/* Header with Title & Live badge */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 px-1">
        <div>
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-['Space_Grotesk']">
            {t('weatherIntelligence', 'WEATHER INTELLIGENCE')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Space_Grotesk']">
            {t('currentConditions', 'Current Conditions')}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {t('updatedJustNow', 'Updated just now')}
        </div>
      </div>

      {/* 8 Responsive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              className="glass-panel glass-panel-interactive rounded-2xl p-5 border border-cyan-500/15 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`p-2 rounded-xl ${card.iconBg} ${card.iconColor} border border-cyan-500/20 group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Space_Grotesk'] tracking-tight">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-sm font-semibold text-cyan-400">{card.unit}</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{card.subtitle}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                    card.status
                  )}`}
                >
                  {card.status}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
