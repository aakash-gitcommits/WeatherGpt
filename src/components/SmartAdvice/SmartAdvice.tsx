import React from 'react';
import {
  Shirt,
  HeartPulse,
  Compass,
  Activity,
  Bike,
  Footprints,
  Trophy,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { WeatherData, ActivityItem } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { generateActivityRecommendations } from '../../services/weatherService';
import {
  translateStatus,
  getLocalizedWearTitle,
  getLocalizedWearAdvice,
  getLocalizedHealthAdvice,
  getLocalizedActivityReason,
} from '../../i18n/utils';

interface SmartAdviceProps {
  weather: WeatherData;
}

export const SmartAdvice: React.FC<SmartAdviceProps> = ({ weather }) => {
  const { t } = useLanguage();

  const activities: ActivityItem[] = generateActivityRecommendations(
    weather.temperature,
    weather.rainChance,
    weather.aqi,
    weather.uvIndex,
    weather.windSpeed
  );

  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'Good':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            {t('good', 'Good')}
          </span>
        );
      case 'Moderate':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            {t('moderate', 'Moderate')}
          </span>
        );
      case 'Poor':
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            {t('poor', 'Poor')}
          </span>
        );
    }
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'Bike':
        return <Bike className="w-4 h-4 text-sky-400" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4 text-emerald-400" />;
      case 'Trophy':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-blue-400" />;
      case 'Camera':
      default:
        return <Camera className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <section id="smart-weather-advice-section" className="w-full space-y-6">
      {/* 1. Smart Weather Advice Cards */}
      <div className="space-y-3">
        <div className="px-1">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-['Space_Grotesk']">
            {t('smartWeatherAdvice', 'SMART WEATHER ADVICE')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Space_Grotesk']">
            {t('guidanceAndTips', 'Guidance & Recommendations')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: What to Wear */}
          <div className="glass-panel glass-panel-interactive rounded-2xl p-5 border border-cyan-500/15 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shrink-0">
              <Shirt className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {t('whatToWear', 'WHAT TO WEAR')}
              </span>
              <h3 className="text-base font-bold text-slate-100">
                {getLocalizedWearTitle(weather.temperature, weather.rainChance, t)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {getLocalizedWearAdvice(weather.temperature, weather.rainChance, t)}
              </p>
            </div>
          </div>

          {/* Card 2: Health & Safety */}
          <div className="glass-panel glass-panel-interactive rounded-2xl p-5 border border-cyan-500/15 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 shrink-0">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {t('healthAndSafety', 'HEALTH & AIR SAFETY')}
              </span>
              <h3 className="text-base font-bold text-slate-100">
                AQI {weather.aqi} • {translateStatus(weather.aqiStatus, t)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {getLocalizedHealthAdvice(weather.aqi, weather.uvIndex, t)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Activity Recommendations Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-200 font-['Space_Grotesk']">
            {t('activityRecommendations', 'Activity Recommendations')}
          </h3>
          <span className="text-xs text-slate-400">
            {t('outdoorFeasibility', 'Outdoor Feasibility')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activities.map((item) => (
            <div
              key={item.key}
              className="glass-panel glass-panel-interactive rounded-2xl p-4 border border-cyan-500/15 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    {getActivityIcon(item.icon)}
                  </div>
                  <span className="font-bold text-sm text-slate-100">
                    {t(item.key, item.name)}
                  </span>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {getLocalizedActivityReason(
                  item.key,
                  weather.temperature,
                  weather.rainChance,
                  weather.aqi,
                  weather.uvIndex,
                  weather.windSpeed,
                  t
                ) || item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

