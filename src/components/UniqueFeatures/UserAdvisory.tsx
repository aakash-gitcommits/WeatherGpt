import React, { useState, useEffect } from 'react';
import { WeatherData, ForecastDay } from '../../types/weather';
import { AdvisoryProfileId, UserAdvisoryData } from '../../types/uniqueFeatures';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { loadSavedProfile, saveSelectedProfile } from '../../services/storageService';
import { fetchUserAdvisoryAI } from '../../services/aiService';
import {
  UserCheck,
  Wheat,
  Ship,
  Luggage,
  Car,
  HardHat,
  GraduationCap,
  Activity,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sun,
  CloudRain,
  Wind,
} from 'lucide-react';

interface UserAdvisoryProps {
  currentWeather: WeatherData;
  forecast: ForecastDay[];
}

interface ProfileMeta {
  id: AdvisoryProfileId;
  nameKey: string;
  defaultName: string;
  categoryKey: string;
  defaultCategory: string;
  icon: React.ElementType;
  color: string;
  descKey: string;
  defaultDesc: string;
}

const PROFILES: ProfileMeta[] = [
  {
    id: 'farmer',
    nameKey: 'profileFarmer',
    defaultName: 'Farmer & Agriculture',
    categoryKey: 'categoryFarmer',
    defaultCategory: 'Agronomy & Sowing',
    icon: Wheat,
    color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    descKey: 'descFarmer',
    defaultDesc: 'Irrigation timing, crop spray windows, soil moisture, and harvesting advisories.',
  },
  {
    id: 'fisherman',
    nameKey: 'profileFisherman',
    defaultName: 'Fisherman & Marine',
    categoryKey: 'categoryFisherman',
    defaultCategory: 'Coastal & Deep Sea',
    icon: Ship,
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    descKey: 'descFisherman',
    defaultDesc: 'Wave swell conditions, coastal wind squalls, tidal cycles, and sea safety alerts.',
  },
  {
    id: 'traveler',
    nameKey: 'profileTraveler',
    defaultName: 'Traveler & Tourist',
    categoryKey: 'categoryTraveler',
    defaultCategory: 'Sightseeing & Transit',
    icon: Luggage,
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    descKey: 'descTraveler',
    defaultDesc: 'Sightseeing comfort, packing checklist, flight/rail visibility, and outdoor timing.',
  },
  {
    id: 'commuter',
    nameKey: 'profileCommuter',
    defaultName: 'Daily Commuter',
    categoryKey: 'categoryCommuter',
    defaultCategory: 'Traffic & Transit',
    icon: Car,
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    descKey: 'descCommuter',
    defaultDesc: 'Peak hour road conditions, rain delay buffers, visibility, and transit comfort.',
  },
  {
    id: 'outdoor_worker',
    nameKey: 'profileOutdoorWorker',
    defaultName: 'Outdoor & Construction',
    categoryKey: 'categoryOutdoorWorker',
    defaultCategory: 'Field Operations',
    icon: HardHat,
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    descKey: 'descOutdoorWorker',
    defaultDesc: 'Wet bulb heat stress, high-wind crane risks, hydration schedules, and UV shielding.',
  },
  {
    id: 'student',
    nameKey: 'profileStudent',
    defaultName: 'Student & Youth',
    categoryKey: 'categoryStudent',
    defaultCategory: 'Campus & Sports',
    icon: GraduationCap,
    color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
    descKey: 'descStudent',
    defaultDesc: 'School transport safety, outdoor sports playability, and exam commute conditions.',
  },
  {
    id: 'runner',
    nameKey: 'profileRunner',
    defaultName: 'Athlete & Runner',
    categoryKey: 'categoryRunner',
    defaultCategory: 'Fitness & Cardio',
    icon: Activity,
    color: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
    descKey: 'descRunner',
    defaultDesc: 'Cardio AQI threshold, optimum jogging hours, heat index, and electrolyte advice.',
  },
  {
    id: 'senior',
    nameKey: 'profileSenior',
    defaultName: 'Senior Citizen',
    categoryKey: 'categorySenior',
    defaultCategory: 'Health & Wellness',
    icon: HeartPulse,
    color: 'text-teal-400 bg-teal-500/20 border-teal-500/30',
    descKey: 'descSenior',
    defaultDesc: 'Respiratory particulate warnings, joint comfort index, and temperature sensitivity.',
  },
];

export const UserAdvisory: React.FC<UserAdvisoryProps> = ({ currentWeather, forecast }) => {
  const { t, language } = useLanguage();

  const [selectedProfileId, setSelectedProfileId] = useState<AdvisoryProfileId>(() =>
    loadSavedProfile()
  );
  const [advisoryData, setAdvisoryData] = useState<UserAdvisoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentProfile = PROFILES.find((p) => p.id === selectedProfileId) || PROFILES[0];

  useEffect(() => {
    saveSelectedProfile(selectedProfileId);
    generateAdvisory(selectedProfileId);
  }, [selectedProfileId, currentWeather.city, language]);

  const generateAdvisory = async (profileId: AdvisoryProfileId) => {
    setIsLoading(true);
    try {
      const prof = PROFILES.find((p) => p.id === profileId) || PROFILES[0];
      const aiResponse = await fetchUserAdvisoryAI(
        prof.id,
        t(prof.nameKey, prof.defaultName),
        currentWeather,
        language
      );

      // Structure domain-specific advice
      const temp = currentWeather.temperature;
      const rain = currentWeather.rainChance;
      const aqi = currentWeather.aqi;
      const wind = currentWeather.windSpeed;

      let score = 85;
      if (rain > 50) score -= 25;
      if (aqi > 150) score -= 20;
      if (temp > 36 || temp < 10) score -= 15;
      if (wind > 35) score -= 15;
      score = Math.max(20, Math.min(98, score));

      const structured = buildStructuredAdvisory(profileId, currentWeather, aiResponse, score);
      setAdvisoryData(structured);
    } catch (e) {
      console.error('Failed to generate advisory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const buildStructuredAdvisory = (
    profileId: AdvisoryProfileId,
    w: WeatherData,
    aiText: string,
    score: number
  ): UserAdvisoryData => {
    switch (profileId) {
      case 'farmer':
        return {
          profileId,
          goodNews: [
            w.rainChance < 30
              ? 'Low precipitation risk enables uninterrupted fertilizer spraying and field tillage.'
              : 'Moderate rainfall will naturally replenish root zone soil moisture.',
            `Daytime temperature (${w.temperature}°C) is conducive for photosynthetic grain filling.`,
          ],
          badNews: [
            w.humidity > 75 ? 'Elevated humidity may increase vulnerability to fungal leaf rust.' : 'Dry surface conditions require regulated drip irrigation.',
            w.windSpeed > 25 ? `Wind gusts (${w.windSpeed} km/h) may cause pesticide spray drift.` : 'Stable wind conditions.',
          ],
          warnings: [
            w.rainChance > 60 ? 'Postpone chemical pesticide spraying; rain will wash off foliar treatments.' : 'Monitor local canal water releases.',
            w.temperature > 38 ? 'High heat stress: irrigate fields during early morning (05:00 - 08:00).' : 'Maintain standard harvest protocols.',
          ],
          recommendations: [
            'Schedule field machinery operations during morning hours.',
            'Ensure grain storage silos are elevated and weatherproofed against moisture.',
            'Inspect crop beds for early pest infestations under humid conditions.',
          ],
          fullSummary: aiText,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suitabilityScore: score,
        };

      case 'fisherman':
        return {
          profileId,
          goodNews: [
            w.windSpeed < 25 ? 'Gentle coastal breeze ensures manageable swell height.' : 'Good water temperature for near-shore schooling.',
            w.visibility > 8 ? 'High maritime visibility for navigation.' : 'Safe daytime horizon.',
          ],
          badNews: [
            w.windSpeed > 35 ? `High wind squalls (${w.windSpeed} km/h) creating choppy surf.` : 'Standard tidal movement.',
            w.rainChance > 50 ? 'Rain squalls may reduce coastal visibility rapidly.' : 'Low rain disturbance.',
          ],
          warnings: [
            w.windSpeed > 45 ? 'IMD Warning: Fishermen advised NOT to venture into deep sea today.' : 'Keep VHF marine radio tuned to Channel 16.',
            'Check GPS emergency locator beacons and life jackets before casting off.',
          ],
          recommendations: [
            'Carry extra fuel buffer and secure deck gear against sudden squalls.',
            'Return to harbor if barometric pressure drops suddenly.',
          ],
          fullSummary: aiText,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suitabilityScore: score,
        };

      case 'runner':
        return {
          profileId,
          goodNews: [
            w.temperature < 28 ? 'Comfortable temperature window for aerobic cardio.' : 'Warm muscle warmup conditions.',
            w.rainChance < 20 ? 'Dry running tracks with optimal traction.' : 'Cooling rain effect for short runs.',
          ],
          badNews: [
            w.aqi > 150 ? `Poor AQI (${w.aqi}) can cause respiratory irritation during high ventilation.` : 'Air quality is within acceptable bounds.',
            w.uvIndex > 6 ? `High UV index (${w.uvIndex}) during midday.` : 'Moderate UV level.',
          ],
          warnings: [
            w.aqi > 200 ? 'Switch outdoor running to indoor treadmill or gym session.' : 'Stay well-hydrated with electrolyte fluids.',
          ],
          recommendations: [
            'Best workout window: 05:30 AM to 07:15 AM before traffic ozone buildup.',
            'Wear moisture-wicking apparel and lightweight running sunglasses.',
          ],
          fullSummary: aiText,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suitabilityScore: score,
        };

      case 'senior':
        return {
          profileId,
          goodNews: [
            'Stable atmospheric pressure supports cardiovascular comfort.',
            `Pleasant daytime ambient temperature around ${w.temperature}°C.`,
          ],
          badNews: [
            w.aqi > 140 ? `AQI is elevated (${w.aqi}). Fine particulates can exacerbate asthma or cough.` : 'Air is relatively clean.',
            w.humidity > 80 ? 'High humidity may feel stuffy indoors.' : 'Normal humidity levels.',
          ],
          warnings: [
            w.aqi > 160 ? 'Wear an N95 mask if stepping out for essential appointments.' : 'Avoid stepping out during peak midday heat.',
          ],
          recommendations: [
            'Take light walks in shaded parks only during morning hours (07:00 - 08:30).',
            'Keep prescribed inhalers and regular medication readily accessible.',
            'Maintain indoor hydration with warm herbal teas or coconut water.',
          ],
          fullSummary: aiText,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suitabilityScore: score,
        };

      default:
        return {
          profileId,
          goodNews: [
            `Current temperature of ${w.temperature}°C is manageable for standard activities.`,
            w.rainChance < 30 ? 'Low rain probability supports outdoor plans.' : 'Cooling breezes present.',
          ],
          badNews: [
            w.rainChance > 40 ? `Rain chance (${w.rainChance}%) may lead to transit congestion.` : 'Normal transit conditions.',
            w.aqi > 150 ? `AQI (${w.aqi}) requires mild caution for sensitive groups.` : 'Acceptable air quality.',
          ],
          warnings: [
            w.rainChance > 50 ? 'Carry an umbrella or raincoat to prevent getting drenched.' : 'Stay hydrated and protect skin from sun glare.',
          ],
          recommendations: [
            'Plan outdoor errands during mid-morning or early evening.',
            'Check live transit maps before commencing long road journeys.',
          ],
          fullSummary: aiText,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suitabilityScore: score,
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {t('userAdvisoryTitle', 'User-Based Specialized Weather Advisory')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t(
                'userAdvisoryDesc',
                'Hyper-tailored meteorological guidance crafted for distinct vocations and lifestyles. Select your category to unlock specialized insights covering opportunities, hazards, warnings, and gear.'
              )}
            </p>
          </div>

          <button
            onClick={() => generateAdvisory(selectedProfileId)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 active:scale-95 transition-all shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{t('refreshAdvisory', 'Refresh AI Advisory')}</span>
          </button>
        </div>
      </div>

      {/* Category Profile Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROFILES.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedProfileId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProfileId(p.id)}
              className={`p-4 rounded-3xl text-left border transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'glass-panel border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'glass-panel border-slate-800/80 hover:border-slate-700 bg-slate-900/60 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl border ${p.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {t(p.nameKey, p.defaultName)}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {t(p.categoryKey, p.defaultCategory)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Structured Advisory Sections */}
      {advisoryData && (
        <div className="space-y-5">
          {/* Top Profile Summary Bar */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${currentProfile.color}`}>
                <currentProfile.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {t(currentProfile.nameKey, currentProfile.defaultName)} {t('advisoryReport', 'Advisory Report')}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                    {currentWeather.location}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t(currentProfile.descKey, currentProfile.defaultDesc)}
                </p>
              </div>
            </div>

            {/* Suitability Gauge */}
            <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {t('activitySuitability', 'Activity Suitability')}
                </span>
                <span
                  className={`text-sm font-extrabold font-mono ${
                    advisoryData.suitabilityScore > 75
                      ? 'text-emerald-400'
                      : advisoryData.suitabilityScore > 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {advisoryData.suitabilityScore}% {t('favorable', 'Favorable')}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-cyan-500/40 flex items-center justify-center font-bold text-xs text-white">
                {advisoryData.suitabilityScore}
              </div>
            </div>
          </div>

          {/* 4 Core Advisory Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Good News */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/15 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('goodNewsTitle', '1. Favorable Conditions & Opportunities')}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {advisoryData.goodNews.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Bad News / Challenges */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-amber-500/30 bg-amber-950/15 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{t('badNewsTitle', '2. Atmospheric Hurdles & Challenges')}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {advisoryData.badNews.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Critical Warnings */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-red-500/30 bg-red-950/15 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertOctagon className="w-5 h-5" />
                <span>{t('criticalWarningsTitle', '3. Critical Warnings & Red Flags')}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {advisoryData.warnings.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Actionable Recommendations & Gear */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-cyan-950/15 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Lightbulb className="w-5 h-5" />
                <span>{t('recommendationsTitle', '4. Actionable Advice & Gear Protocol')}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {advisoryData.recommendations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Comprehensive Domain Synthesis */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-purple-500/30 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Sparkles className="w-4 h-4" />
              <span>{t('aiDomainSynthesis', 'Gemini AI Domain Synthesis')}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {advisoryData.fullSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
