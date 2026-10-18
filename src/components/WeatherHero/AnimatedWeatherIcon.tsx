import React from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudSnow,
  Wind,
  CloudFog,
} from 'lucide-react';
import { WeatherData } from '../../types/weather';

interface AnimatedWeatherIconProps {
  iconCode: WeatherData['iconCode'];
  condition?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  iconCode,
  condition = '',
  size = 'hero',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    hero: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const containerSize = sizeMap[size];

  switch (iconCode) {
    case 'clear':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
          <Sun className="w-full h-full text-amber-400 animate-spin-slow drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
        </div>
      );
    case 'partly-cloudy':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
          <CloudSun className="w-full h-full text-cyan-300 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
        </div>
      );
    case 'clouds':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <div className="absolute inset-0 bg-slate-400/10 rounded-full blur-lg" />
          <Cloud className="w-full h-full text-slate-300 drop-shadow-[0_0_15px_rgba(148,163,184,0.4)]" />
        </div>
      );
    case 'rain':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          <CloudRain className="w-full h-full text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]" />
        </div>
      );
    case 'thunderstorm':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <div className="absolute inset-0 bg-purple-500/25 rounded-full blur-xl animate-pulse" />
          <CloudLightning className="w-full h-full text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.7)]" />
        </div>
      );
    case 'drizzle':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <CloudDrizzle className="w-full h-full text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
        </div>
      );
    case 'snow':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <div className="absolute inset-0 bg-sky-200/20 rounded-full blur-lg" />
          <CloudSnow className="w-full h-full text-sky-200 drop-shadow-[0_0_18px_rgba(186,230,253,0.6)]" />
        </div>
      );
    case 'mist':
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <CloudFog className="w-full h-full text-slate-300" />
        </div>
      );
    case 'wind':
    default:
      return (
        <div className={`relative flex items-center justify-center ${containerSize}`}>
          <Wind className="w-full h-full text-cyan-400" />
        </div>
      );
  }
};
