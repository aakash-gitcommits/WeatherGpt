import React, { useState } from 'react';
import { WeatherData } from '../../types/weather';
import { DisasterAlertEvent } from '../../types/uniqueFeatures';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CloudRain,
  Wind,
  PhoneCall,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

interface DisasterAlertsProps {
  currentWeather: WeatherData;
}

const HISTORICAL_DISASTERS: DisasterAlertEvent[] = [
  {
    id: 'disaster-dana-2024',
    name: 'Severe Cyclonic Storm "Dana"',
    location: 'Dhamra & Bhitarkanika Coast',
    region: 'Odisha & West Bengal',
    date: 'October 24-25, 2024',
    type: 'cyclone',
    severity: 'critical',
    windSpeedKmH: 120,
    rainfallMm: 280,
    details:
      'Severe Cyclonic Storm Dana made landfall between Dhamra and Bhitarkanika National Park in Odisha with sustained winds of 100-110 km/h gusting to 120 km/h. Over 600,000 residents were safely evacuated by NDRF and state disaster management authorities.',
    safetyGuidance: [
      'Evacuate low-lying coastal zones immediately upon warning.',
      'Stay away from damaged power lines, fallen trees, and glass facades.',
      'Maintain emergency supplies: non-perishable food, flashlights, water, and power banks.',
    ],
    helplines: ['NDRF Control Room: 1078', 'Odisha Disaster Control: 1070 / 0674-2534177', 'National Emergency: 112'],
    impactSummary: 'Zero casualties reported in major districts due to rapid early evacuation and automated radar monitoring.',
  },
  {
    id: 'disaster-remal-2024',
    name: 'Severe Cyclone "Remal"',
    location: 'Sagar Island & Khepupara',
    region: 'West Bengal, Bangladesh & Northeast India',
    date: 'May 26-27, 2024',
    type: 'cyclone',
    severity: 'critical',
    windSpeedKmH: 135,
    rainfallMm: 310,
    details:
      'Cyclone Remal struck the Sundarbans coastal delta with gale-force winds exceeding 135 km/h, causing massive tidal surges, uprooted transmission towers, and flash flooding across West Bengal and Mizoram.',
    safetyGuidance: [
      'Avoid venturing into the Bay of Bengal or coastal estuaries.',
      'Reinforce loose tin roofs and anchor water tanks.',
      'Remain indoors in reinforced concrete structures until all-clear broadcast.',
    ],
    helplines: ['WB State Emergency Ops: 1070', 'NDRF: 1078', 'Kolkata Police Disaster: 033-22143024'],
  },
  {
    id: 'disaster-heatwave-2024',
    name: 'Record North India Extreme Heatwave',
    location: 'Delhi NCR, Rajasthan, Haryana, UP, Bihar',
    region: 'North & Central India',
    date: 'May - June 2024',
    type: 'heatwave',
    severity: 'severe',
    maxTempC: 49.9,
    details:
      'Severe heatwave conditions gripped Northern India for over 35 consecutive days with temperatures surpassing 49°C in Mungeshpur (Delhi), Phalodi (Rajasthan), and Sirsa (Haryana), severely straining power grids and water supplies.',
    safetyGuidance: [
      'Avoid direct outdoor sun exposure between 11:30 AM and 4:30 PM.',
      'Consume oral rehydration solutions (ORS), lemon water, and chaas frequently.',
      'Never leave children or pets inside locked parked vehicles.',
      'Wear loose, light-colored cotton fabrics and wide-brim headgear.',
    ],
    helplines: ['National Heat Advisory Helpline: 1075', 'Ambulance Service: 108'],
  },
  {
    id: 'disaster-michaung-2023',
    name: 'Super Storm & Cyclone "Michaung"',
    location: 'Chennai Coast & South Andhra Pradesh',
    region: 'Tamil Nadu & Andhra Pradesh',
    date: 'December 3-5, 2023',
    type: 'cyclone',
    severity: 'critical',
    windSpeedKmH: 110,
    rainfallMm: 450,
    details:
      'Cyclone Michaung hovered near Chennai coast for 24+ hours dropping 450mm of torrential rain, flooding the metropolitan airport runway and low-lying residential basins before landfall near Bapatla.',
    safetyGuidance: [
      'Do not attempt to drive through flooded underpasses or stagnant water.',
      'Turn off main electrical circuit breakers in waterlogged residences.',
      'Boil municipal drinking water before consumption to prevent waterborne illness.',
    ],
    helplines: ['Greater Chennai Corp Helpline: 1913', 'TNSDMA Emergency: 1070'],
  },
  {
    id: 'disaster-yamuna-2023',
    name: 'Delhi Yamuna Basin Record Floods',
    location: 'Delhi NCR, Ring Road, Red Fort Area',
    region: 'Delhi, Haryana, Himachal Pradesh',
    date: 'July 10-16, 2023',
    type: 'flood',
    severity: 'severe',
    rainfallMm: 350,
    details:
      'Yamuna river water levels reached an all-time historic high of 208.66 meters following unprecedented cloudbursts in Himachal Pradesh and heavy discharge from Hathnikund Barrage, submerging parts of ITO, Civil Lines, and Ring Road.',
    safetyGuidance: [
      'Evacuate riverbank lowlands and temporary floodplains.',
      'Do not walk or drive through flowing flood currents.',
      'Protect electronic documents in waterproof sealed bags.',
    ],
    helplines: ['Delhi Disaster Management: 1077', 'Delhi Flood Control: 011-22421656'],
  },
  {
    id: 'disaster-biparjoy-2023',
    name: 'Very Severe Cyclonic Storm "Biparjoy"',
    location: 'Jakhau Port & Kutch Coast',
    region: 'Gujarat & Rajasthan',
    date: 'June 14-16, 2023',
    type: 'cyclone',
    severity: 'critical',
    windSpeedKmH: 140,
    rainfallMm: 290,
    details:
      'Cyclone Biparjoy traveled over the Arabian Sea for 10+ days before making landfall at Jakhau Port in Gujarat with 140 km/h wind gusts. Effective preemptive relocation of 100,000+ people prevented casualties.',
    safetyGuidance: [
      'Heed port caution signals (Great Danger Signal 9 & 10).',
      'Tie down heavy outdoor equipment and stay away from coastal cliffs.',
    ],
    helplines: ['Gujarat State Emergency Ops: 1070 / 079-23251900', 'NDRF: 1078'],
  },
];

export const DisasterAlerts: React.FC<DisasterAlertsProps> = ({ currentWeather }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  const [filterType, setFilterType] = useState<'all' | 'cyclone' | 'flood' | 'heatwave' | 'severe_storm'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDisasterId, setExpandedDisasterId] = useState<string | null>('disaster-dana-2024');

  // Evaluate current weather against severe disaster thresholds
  const isExtremeHeat = currentWeather.temperature >= 42;
  const isHighWind = currentWeather.windSpeed >= 50;
  const isExtremeRain = currentWeather.rainChance >= 85;
  const isSevereSmog = currentWeather.aqi >= 300;

  const hasActiveSeverity = isExtremeHeat || isHighWind || isExtremeRain || isSevereSmog;

  const filteredDisasters = HISTORICAL_DISASTERS.filter((d) => {
    const matchesFilter = filterType === 'all' || d.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const triggerDisasterSimulation = () => {
    addNotification({
      title: '🚨 SEVERE WEATHER WARNING: High Wind & Rain Surge',
      message: `Emergency Alert for ${currentWeather.location}: Severe squall conditions with gusts up to 65 km/h and heavy rainfall forecasted. Please stay indoors!`,
      type: 'disaster',
      severity: 'critical',
      actionFeature: 'disasters',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-red-500/30 shadow-xl relative overflow-hidden bg-red-950/20">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t('disasterAlertsTitle', 'Disaster Alerts & Meteorological History Archive')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t(
                'disasterAlertsDesc',
                'Real-time extreme atmospheric surveillance engine paired with a comprehensive catalog of verified Indian cyclonic storms, monsoon inundations, and heatwaves.'
              )}
            </p>
          </div>

          <button
            onClick={triggerDisasterSimulation}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/25 active:scale-95 transition-all shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>{t('testDisasterAlert', 'Test Emergency Alert')}</span>
          </button>
        </div>
      </div>

      {/* Active Surveillance Watch Status */}
      <div
        className={`glass-panel p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
          hasActiveSeverity
            ? 'border-red-500/60 bg-red-950/40 text-red-100'
            : 'border-emerald-500/30 bg-slate-900/80 text-slate-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border ${
                hasActiveSeverity
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {hasActiveSeverity ? (
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {hasActiveSeverity
                  ? `${t('activeSevereWeatherAlert', 'Active Severe Weather Alert for')} ${currentWeather.city}`
                  : `${t('currentLocalSurveillanceNormal', 'Current Local Surveillance: Normal & Stable')} (${currentWeather.city})`}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {hasActiveSeverity
                  ? t('surveillanceAlertDesc', 'Atmospheric metrics exceed safety thresholds. Follow safety protocols.')
                  : t('surveillanceNormalDesc', 'No active cyclonic storm or severe deluge warnings detected in your immediate radius.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              {t('wind', 'Wind')}: <strong>{currentWeather.windSpeed} km/h</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              {t('rain', 'Rain')}: <strong>{currentWeather.rainChance}%</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              {t('aqiTab', 'AQI')}: <strong>{currentWeather.aqi}</strong>
            </span>
          </div>
        </div>

        {/* Emergency Helplines Strip */}
        <div className="mt-4 pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-cyan-400 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4" />
            <span>{t('emergencyHelplinesTitle', '24x7 Verified Indian Helplines:')}</span>
          </span>

          <div className="flex flex-wrap gap-2 text-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 font-mono">
              NDRF: <strong>1078</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 font-mono">
              National Emergency: <strong>112</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 font-mono">
              Ambulance: <strong>108</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 font-mono">
              IMD Weather: <strong>1800-180-1717</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Historical Disaster Archive Explorer */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/20 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t('historicalDisastersTitle', 'Major Indian Meteorological Disasters Archive')}
            </h3>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('disasterSearchPlaceholder', 'Search cyclone, flood, state...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: t('filterAllDisasters', 'All Disasters') },
            { id: 'cyclone', label: t('filterCyclones', 'Cyclonic Storms') },
            { id: 'flood', label: t('filterFloods', 'Floods & Inundations') },
            { id: 'heatwave', label: t('filterHeatwaves', 'Extreme Heatwaves') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Disaster Cards Accordion List */}
        <div className="space-y-3">
          {filteredDisasters.map((disaster) => {
            const isExpanded = expandedDisasterId === disaster.id;
            return (
              <div
                key={disaster.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all overflow-hidden"
              >
                <div
                  onClick={() => setExpandedDisasterId(isExpanded ? null : disaster.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                      {disaster.type === 'cyclone' ? (
                        <Wind className="w-5 h-5 text-cyan-400" />
                      ) : disaster.type === 'heatwave' ? (
                        <Flame className="w-5 h-5 text-orange-400" />
                      ) : (
                        <CloudRain className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">
                          {disaster.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
                          {disaster.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{disaster.region}</span>
                        </span>
                        <span>•</span>
                        <span>{disaster.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {disaster.windSpeedKmH && (
                      <span className="hidden sm:inline-block text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2 py-1 rounded-lg border border-cyan-800">
                        {disaster.windSpeedKmH} km/h {t('peak', 'peak')}
                      </span>
                    )}
                    {disaster.maxTempC && (
                      <span className="hidden sm:inline-block text-xs font-mono text-orange-300 bg-orange-950/50 px-2 py-1 rounded-lg border border-orange-800">
                        {disaster.maxTempC}°C {t('peak', 'peak')}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-4 text-xs">
                    <p className="text-slate-200 leading-relaxed font-sans mt-3">
                      {disaster.details}
                    </p>

                    {disaster.impactSummary && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                        <strong>{t('outcomeMitigation', 'Outcome / Mitigation:')}</strong> {disaster.impactSummary}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <span className="font-bold text-amber-300 block">
                        {t('safetyProtocolsLessons', 'Safety Protocols & Lessons:')}
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {disaster.safetyGuidance.map((guide, idx) => (
                          <li key={idx}>{guide}</li>
                        ))}
                      </ul>
                    </div>

                    {disaster.helplines && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {disaster.helplines.map((line, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
