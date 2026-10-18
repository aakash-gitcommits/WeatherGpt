import React from 'react';
import { CloudSun, Sparkles, Shield, Heart } from 'lucide-react';
import { useLanguage } from '../../i18n/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer id="app-footer" className="w-full mt-12 py-8 px-4 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        {/* Brand & Mission */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <CloudSun className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200 text-sm font-['Space_Grotesk']">
              Weather<span className="text-cyan-400">GPT</span>
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>{t('footerTagline', 'Next-Generation AI Weather Intelligence Platform')}</span>
        </div>

        {/* Telemetry Nodes & Attribution */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Open-Meteo API
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            OpenStreetMap
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Google Gemini 2.5
          </span>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right text-slate-400 text-[11px]">
          © {new Date().getFullYear()} {t('footerCopyright', 'WeatherGPT. Built for global meteorological intelligence.')}
        </div>
      </div>
    </footer>
  );
};
