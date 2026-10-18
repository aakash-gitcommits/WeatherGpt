import React, { useState, useEffect } from 'react';
import { WeatherData } from '../../types/weather';
import {
  TransportMode,
  RouteWaypoint,
  RouteIntelligenceResult,
} from '../../types/uniqueFeatures';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { fetchRouteIntelligenceSummary } from '../../services/aiService';
import { fetchWeatherData, searchLocations } from '../../services/weatherService';
import {
  Navigation,
  Car,
  Train,
  Bus,
  Plane,
  Bike,
  Sparkles,
  MapPin,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  RefreshCw,
  Droplets,
  Wind,
  Sun,
  Search,
} from 'lucide-react';

interface RouteIntelligenceProps {
  currentWeather: WeatherData;
}

interface PopularRoutePreset {
  name: string;
  start: string;
  dest: string;
  mode: TransportMode;
  waypoints: Array<{ name: string; lat: number; lon: number; distanceKm: number; etaHours: number }>;
}

const POPULAR_ROUTES: PopularRoutePreset[] = [
  {
    name: 'Delhi ➔ Pune Corridor',
    start: 'Delhi',
    dest: 'Pune',
    mode: 'flight',
    waypoints: [
      { name: 'Delhi NCR', lat: 28.6139, lon: 77.209, distanceKm: 0, etaHours: 0 },
      { name: 'Jaipur / Gwalior', lat: 26.9124, lon: 75.7873, distanceKm: 280, etaHours: 1.5 },
      { name: 'Bhopal / Indore', lat: 23.2599, lon: 77.4126, distanceKm: 780, etaHours: 3.5 },
      { name: 'Nashik Transit', lat: 19.9975, lon: 73.7898, distanceKm: 1240, etaHours: 5.5 },
      { name: 'Pune Terminal', lat: 18.5204, lon: 73.8567, distanceKm: 1440, etaHours: 6.5 },
    ],
  },
  {
    name: 'Mumbai ➔ Goa Highway (NH66)',
    start: 'Mumbai',
    dest: 'Goa',
    mode: 'car',
    waypoints: [
      { name: 'Mumbai (Start)', lat: 19.076, lon: 72.8777, distanceKm: 0, etaHours: 0 },
      { name: 'Panvel / Lonavala', lat: 18.7557, lon: 73.4091, distanceKm: 85, etaHours: 1.8 },
      { name: 'Chiplun (Ghats)', lat: 17.5323, lon: 73.518, distanceKm: 250, etaHours: 5.0 },
      { name: 'Ratnagiri Coast', lat: 16.9902, lon: 73.312, distanceKm: 340, etaHours: 7.0 },
      { name: 'Panaji, Goa', lat: 15.4909, lon: 73.8278, distanceKm: 590, etaHours: 10.5 },
    ],
  },
  {
    name: 'Delhi ➔ Jaipur Expressway',
    start: 'Delhi',
    dest: 'Jaipur',
    mode: 'car',
    waypoints: [
      { name: 'Delhi', lat: 28.6139, lon: 77.209, distanceKm: 0, etaHours: 0 },
      { name: 'Gurugram / Manesar', lat: 28.4595, lon: 77.0266, distanceKm: 40, etaHours: 0.8 },
      { name: 'Neemrana / Behror', lat: 27.9892, lon: 76.3846, distanceKm: 125, etaHours: 2.2 },
      { name: 'Kotputli / Shahpura', lat: 27.7056, lon: 76.2045, distanceKm: 185, etaHours: 3.2 },
      { name: 'Jaipur (Pink City)', lat: 26.9124, lon: 75.7873, distanceKm: 275, etaHours: 4.5 },
    ],
  },
  {
    name: 'Bengaluru ➔ Chennai Corridor',
    start: 'Bengaluru',
    dest: 'Chennai',
    mode: 'train',
    waypoints: [
      { name: 'Bengaluru (KSR)', lat: 12.9716, lon: 77.5946, distanceKm: 0, etaHours: 0 },
      { name: 'Hosur / Bangarapet', lat: 12.7409, lon: 77.8253, distanceKm: 45, etaHours: 0.8 },
      { name: 'Jolarpettai Junction', lat: 12.5694, lon: 78.5833, distanceKm: 145, etaHours: 2.1 },
      { name: 'Katpadi / Vellore', lat: 12.9784, lon: 79.1378, distanceKm: 220, etaHours: 3.2 },
      { name: 'Chennai Central', lat: 13.0827, lon: 80.2707, distanceKm: 350, etaHours: 4.8 },
    ],
  },
];

export const RouteIntelligence: React.FC<RouteIntelligenceProps> = ({ currentWeather }) => {
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();

  const [startLoc, setStartLoc] = useState('Delhi');
  const [destLoc, setDestLoc] = useState('Pune');
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteIntelligenceResult | null>(null);

  // Auto-run default popular route on mount
  useEffect(() => {
    handleRunRouteAnalysis(POPULAR_ROUTES[0]);
  }, []);

  const handleRunRouteAnalysis = async (preset?: PopularRoutePreset) => {
    setIsAnalyzing(true);
    const start = preset ? preset.start : startLoc;
    const dest = preset ? preset.dest : destLoc;
    const mode = preset ? preset.mode : transportMode;

    try {
      // Determine waypoints
      let baseWaypoints = preset ? preset.waypoints : [];

      if (!preset || baseWaypoints.length === 0) {
        // Build dynamic waypoints by geocoding
        const [startGeo, destGeo] = await Promise.all([
          searchLocations(start),
          searchLocations(dest),
        ]);

        const startCoords = startGeo[0] || { latitude: currentWeather.lat, longitude: currentWeather.lon, name: start };
        const destCoords = destGeo[0] || { latitude: 18.5204, longitude: 73.8567, name: dest };

        // Generate 3 intermediate interpolation waypoints
        const p1Lat = startCoords.latitude + (destCoords.latitude - startCoords.latitude) * 0.25;
        const p1Lon = startCoords.longitude + (destCoords.longitude - startCoords.longitude) * 0.25;

        const p2Lat = startCoords.latitude + (destCoords.latitude - startCoords.latitude) * 0.5;
        const p2Lon = startCoords.longitude + (destCoords.longitude - startCoords.longitude) * 0.5;

        const p3Lat = startCoords.latitude + (destCoords.latitude - startCoords.latitude) * 0.75;
        const p3Lon = startCoords.longitude + (destCoords.longitude - startCoords.longitude) * 0.75;

        baseWaypoints = [
          { name: `${start} (Origin)`, lat: startCoords.latitude, lon: startCoords.longitude, distanceKm: 0, etaHours: 0 },
          { name: `Midpoint Corridor 1`, lat: p1Lat, lon: p1Lon, distanceKm: 250, etaHours: 3.5 },
          { name: `Midway Transit Zone`, lat: p2Lat, lon: p2Lon, distanceKm: 550, etaHours: 7.0 },
          { name: `Approach Corridor`, lat: p3Lat, lon: p3Lon, distanceKm: 850, etaHours: 10.5 },
          { name: `${dest} (Destination)`, lat: destCoords.latitude, lon: destCoords.longitude, distanceKm: 1100, etaHours: 14.0 },
        ];
      }

      // Fetch live weather telemetry for every waypoint in parallel
      const enrichedWaypoints: RouteWaypoint[] = await Promise.all(
        baseWaypoints.map(async (wp, idx) => {
          try {
            const data = await fetchWeatherData(wp.lat, wp.lon, wp.name, 'India');
            const w = data.weather;
            return {
              id: `wp-${idx}`,
              name: wp.name,
              lat: wp.lat,
              lon: wp.lon,
              distanceFromStartKm: wp.distanceKm,
              etaHours: wp.etaHours,
              weather: {
                temperature: w.temperature,
                feelsLike: w.feelsLike,
                condition: w.condition,
                iconCode: w.iconCode,
                rainChance: w.rainChance,
                windSpeed: w.windSpeed,
                windDirection: w.windDirection,
                aqi: w.aqi,
                aqiStatus: w.aqiStatus,
                visibility: w.visibility,
              },
            };
          } catch (e) {
            return {
              id: `wp-${idx}`,
              name: wp.name,
              lat: wp.lat,
              lon: wp.lon,
              distanceFromStartKm: wp.distanceKm,
              etaHours: wp.etaHours,
              weather: {
                temperature: 28,
                feelsLike: 30,
                condition: 'Clear Sky',
                iconCode: 'clear',
                rainChance: 15,
                windSpeed: 14,
                windDirection: 'NW',
                aqi: 120,
                aqiStatus: 'Moderate',
                visibility: 9,
              },
            };
          }
        })
      );

      // Call Gemini Route Intelligence API
      const aiSummary = await fetchRouteIntelligenceSummary(
        start,
        dest,
        mode,
        enrichedWaypoints,
        language
      );

      // Determine overall safety
      const maxRain = Math.max(...enrichedWaypoints.map((w) => w.weather?.rainChance || 0));
      const maxAqi = Math.max(...enrichedWaypoints.map((w) => w.weather?.aqi || 0));
      const maxWind = Math.max(...enrichedWaypoints.map((w) => w.weather?.windSpeed || 0));

      let overallSafety: RouteIntelligenceResult['overallSafety'] = 'safe';
      if (maxRain > 65 || maxWind > 45 || maxAqi > 280) {
        overallSafety = 'hazardous';
      } else if (maxRain > 35 || maxWind > 30 || maxAqi > 180) {
        overallSafety = 'caution';
      }

      const rainSegments = enrichedWaypoints
        .filter((w) => (w.weather?.rainChance || 0) > 40)
        .map((w) => `${w.name} (${w.weather?.rainChance}% rain chance)`);

      const aqiWarnings = enrichedWaypoints
        .filter((w) => (w.weather?.aqi || 0) > 180)
        .map((w) => `${w.name} (AQI: ${w.weather?.aqi} - Poor)`);

      const travelTips = [
        mode === 'car' || mode === 'bike'
          ? 'Check tire pressure and maintain safe braking distance on moist highway stretches.'
          : 'Check carrier schedule for potential weather-related departure delays.',
        'Keep drinking water and sunglasses accessible for daytime glare.',
        maxRain > 40 ? 'Pack rain gear and waterproof covers for baggage.' : 'Clear driving visibility expected along the majority of the route.',
      ];

      const result: RouteIntelligenceResult = {
        startLocation: start,
        destination: dest,
        transportMode: mode,
        waypoints: enrichedWaypoints,
        totalDistanceKm: baseWaypoints[baseWaypoints.length - 1]?.distanceKm || 1200,
        estimatedDurationHours: baseWaypoints[baseWaypoints.length - 1]?.etaHours || 12,
        overallSafety,
        aiSummary,
        rainSegments,
        aqiWarnings,
        travelTips,
        bestDepartureWindow: '06:00 AM - 08:30 AM (Cooler temps & minimal convection)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setRouteResult(result);

      // Notification if hazardous or caution
      if (overallSafety === 'hazardous' || overallSafety === 'caution') {
        addNotification({
          title: `Route Alert: ${start} ➔ ${dest}`,
          message: `Atmospheric caution on route: elevated rain or wind detected across segments.`,
          type: 'autopilot',
          severity: overallSafety === 'hazardous' ? 'critical' : 'warning',
          actionFeature: 'route',
        });
      }
    } catch (e) {
      console.error('Route analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'car':
      case 'cab':
        return <Car className="w-4 h-4" />;
      case 'train':
        return <Train className="w-4 h-4" />;
      case 'bus':
        return <Bus className="w-4 h-4" />;
      case 'flight':
        return <Plane className="w-4 h-4" />;
      case 'bike':
        return <Bike className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Navigation className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {t('routeIntelligenceTitle', 'Route Intelligence & Travel Weather')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t(
                'routeIntelligenceDesc',
                'Simulate and analyze multi-segment atmospheric conditions across major Indian transit corridors. WeatherGPT inspects rain hotspots, AQI smog belts, and wind shear to optimize your departure.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Preset Route Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap pl-1">
          {t('popularCorridors', 'Popular Corridors:')}
        </span>
        {POPULAR_ROUTES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setStartLoc(preset.start);
              setDestLoc(preset.dest);
              setTransportMode(preset.mode);
              handleRunRouteAnalysis(preset);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-slate-700 hover:border-cyan-500/40 whitespace-nowrap transition-all active:scale-95"
          >
            {getTransportIcon(preset.mode)}
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Input Controls */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/20 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('originPoint', 'Starting Point (Origin)')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="text"
                value={startLoc}
                onChange={(e) => setStartLoc(e.target.value)}
                placeholder={t('routeStartPlaceholder', 'e.g. Delhi, Mumbai, Bengaluru')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('destinationPoint', 'Final Destination')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-400 absolute left-3 top-3" />
              <input
                type="text"
                value={destLoc}
                onChange={(e) => setDestLoc(e.target.value)}
                placeholder={t('routeDestPlaceholder', 'e.g. Pune, Goa, Jaipur, Chennai')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('transportMode', 'Mode of Transport')}
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'car', label: t('transportCar', 'Car'), icon: Car },
                { id: 'train', label: t('transportTrain', 'Train'), icon: Train },
                { id: 'bus', label: t('transportBus', 'Bus'), icon: Bus },
                { id: 'flight', label: t('transportFlight', 'Flight'), icon: Plane },
                { id: 'bike', label: t('transportBike', 'Bike'), icon: Bike },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = transportMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setTransportMode(m.id as any)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleRunRouteAnalysis()}
            disabled={isAnalyzing || !startLoc.trim() || !destLoc.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{t('analyzeRouteWeather', 'Analyze Route Telemetry')}</span>
          </button>
        </div>
      </div>

      {/* Results Display */}
      {routeResult && (
        <div className="space-y-5">
          {/* Status & Summary Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  {getTransportIcon(routeResult.transportMode)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{routeResult.startLocation}</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                    <span>{routeResult.destination}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t('estDistance', 'Est.')} {routeResult.totalDistanceKm} {t('kmUnit', 'km')} • ~{routeResult.estimatedDurationHours} {t('hoursTransit', 'hours transit')}
                  </p>
                </div>
              </div>

              {/* Safety Badge */}
              <div className="flex items-center gap-2">
                {routeResult.overallSafety === 'safe' ? (
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('routeSafeStatus', 'Corridor Safe for Travel')}</span>
                  </span>
                ) : routeResult.overallSafety === 'caution' ? (
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{t('routeCautionStatus', 'Moderate Weather Caution')}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/40">
                    <Shield className="w-4 h-4" />
                    <span>{t('routeHazardousStatus', 'Hazardous Meteorological Warning')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* AI Generated Detailed Insights */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>{t('geminiRouteBriefing', 'AI Travel Weather Briefing')}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {routeResult.aiSummary}
              </p>
            </div>

            {/* Recommendation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('bestDepartureWindow', 'Optimal Departure Window')}</span>
                </span>
                <p className="text-xs text-slate-300">
                  {routeResult.bestDepartureWindow}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t('keyPrecautions', 'Key Precautions')}</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                  {routeResult.travelTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stepper Route Timeline Visualizer */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/20 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>{t('corridorTelemetryTimeline', 'Corridor Atmospheric Telemetry Timeline')}</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-emerald-500">
              {routeResult.waypoints.map((wp, idx) => {
                const w = wp.weather;
                const isStart = idx === 0;
                const isEnd = idx === routeResult.waypoints.length - 1;

                return (
                  <div key={wp.id} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                        isStart
                          ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                          : isEnd
                          ? 'bg-red-500 border-red-300 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                          : 'bg-slate-900 border-cyan-400 text-cyan-300'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Waypoint Card */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">
                            {wp.name}
                          </h4>
                          {isStart && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                              {t('origin', 'Origin')}
                            </span>
                          )}
                          {isEnd && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold">
                              {t('destination', 'Destination')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>{wp.distanceFromStartKm} {t('kmUnit', 'km')} {t('kmFromStart', 'from start')}</span>
                          <span>•</span>
                          <span>{t('eta', 'ETA')} ~{wp.etaHours}h</span>
                        </div>
                      </div>

                      {/* Weather Metrics Strip */}
                      {w && (
                        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Sun className="w-4 h-4 text-amber-400" />
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {w.temperature}°C
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[80px]">
                                {w.condition}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-4 h-4 text-cyan-400" />
                            <div>
                              <span className="text-xs font-bold text-cyan-300 block">
                                {w.rainChance}%
                              </span>
                              <span className="text-[10px] text-slate-400 block">{t('rain', 'Rain')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Wind className="w-4 h-4 text-slate-300" />
                            <div>
                              <span className="text-xs font-bold text-slate-200 block">
                                {w.windSpeed} km/h
                              </span>
                              <span className="text-[10px] text-slate-400 block">{t('wind', 'Wind')}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-xs font-bold block ${
                                w.aqi > 150 ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              AQI {w.aqi}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {w.aqiStatus}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
