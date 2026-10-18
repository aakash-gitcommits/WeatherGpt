import React from 'react';
import {
  MapPin,
  ArrowUp,
  ArrowDown,
  Droplets,
  Radio,
  Sparkles,
  Compass,
  Thermometer,
} from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useUnit } from '../../context/UnitContext';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import {
  translateCondition,
  getLocalizedGreeting,
  getLocalizedGuidance,
} from '../../i18n/utils';

interface WeatherHeroProps {
  weather: WeatherData;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({ weather }) => {
  const { t } = useLanguage();
  const { formatTemp } = useUnit();

  // Clean location formatted strictly as "City, Country"
  const locationText = weather.country
    ? (weather.city?.toLowerCase().includes(weather.country.toLowerCase())
        ? weather.city
        : `${weather.city || 'Delhi'}, ${weather.country}`)
    : weather.city || weather.location || 'Delhi, India';

  return (
    <section id="weather-hero-section" className="w-full space-y-4">
      {/* Main Hero Card */}
      <div
        id="main-weather-card"
        className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
      >
        {/* Background futuristic atmospheric glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Right Live Observation Badge */}
        <div className="absolute top-5 right-5 sm:top-7 sm:right-7 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Radio className="w-3 h-3 text-emerald-400" />
          {t('liveObservation', 'Live Observation')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Side: Location & Core Temperature Metrics */}
          <div className="md:col-span-7 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 shrink-0" />
                <h1
                  id="hero-city-name"
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-['Space_Grotesk'] tracking-tight"
                >
                  {locationText}
                </h1>
              </div>
            </div>

            {/* Large Temperature & Condition */}
            <div className="flex flex-wrap items-baseline gap-4 pt-2">
              <div
                id="hero-temperature"
                className="text-6xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-cyan-300 font-['Space_Grotesk'] tracking-tighter"
              >
                {formatTemp(weather.temperature)}
              </div>

              <div className="space-y-1">
                <div
                  id="hero-condition"
                  className="text-xl sm:text-2xl font-bold text-cyan-300 capitalize"
                >
                  {translateCondition(weather.condition, t)}
                </div>
                <div className="text-sm text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span>{t('feelsLike', 'Feels Like')}:</span>
                  <span className="font-semibold text-slate-100">
                    {formatTemp(weather.feelsLike)}
                  </span>
                </div>
              </div>
            </div>

            {/* High & Low Temp Badges */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <ArrowUp className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-400">{t('high', 'High')}:</span>
                <span className="font-bold text-slate-100">{formatTemp(weather.tempMax)}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">{t('low', 'Low')}:</span>
                <span className="font-bold text-slate-100">{formatTemp(weather.tempMin)}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">{t('rainChance', 'Rain')}:</span>
                <span className="font-bold text-blue-300">{weather.rainChance}%</span>
              </div>
            </div>
          </div>

          {/* Right Side: Animated Weather Icon & Weather Status */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/60 border border-cyan-500/10">
            <AnimatedWeatherIcon
              iconCode={weather.iconCode}
              condition={weather.condition}
              size="hero"
            />

            <div className="mt-4 space-y-1">
              <div className="text-sm font-bold tracking-widest uppercase text-slate-200">
                {translateCondition(weather.condition, t)}
              </div>
              <div className="text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>
                  {t('rainChance', 'Rain Chance')}: {weather.rainChance}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Weather Greeting & Daily Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          {/* Card 1: Weather Greeting */}
          <div
            id="card-weather-greeting"
            className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/15 flex items-start gap-3.5 hover:border-cyan-400/30 transition-all shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-['Space_Grotesk']">
                {t('weatherGreetingTitle', 'WEATHER GREETING')}
              </div>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                {getLocalizedGreeting(
                  weather.condition,
                  weather.temperature,
                  weather.rainChance,
                  t
                )}
              </p>
            </div>
          </div>

          {/* Card 2: Daily Guidance */}
          <div
            id="card-daily-guidance"
            className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/15 flex items-start gap-3.5 hover:border-cyan-400/30 transition-all shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-['Space_Grotesk']">
                {t('dailyGuidanceTitle', 'DAILY GUIDANCE')}
              </div>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                {getLocalizedGuidance(
                  weather.temperature,
                  weather.rainChance,
                  weather.uvIndex,
                  weather.aqi,
                  t
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
