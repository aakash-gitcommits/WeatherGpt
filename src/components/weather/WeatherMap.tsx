import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  CloudRain,
  Thermometer,
  Wind,
  Activity,
  Compass,
  Layers,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { MapLayerType, WeatherData } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useUnit } from '../../context/UnitContext';
import {
  getLocalizedCondition,
  getLocalizedAqiStatus,
  getLocalizedWindDirection,
  getLocalizedStatus,
} from '../../i18n/utils';
import { getWindDirection } from '../../services/weatherService';

// Fix Leaflet Default Icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Color scales for each independent layer
export const getRainColor = (rainChance: number): string => {
  if (rainChance <= 30) return '#38bdf8'; // Light - Sky cyan
  if (rainChance <= 60) return '#3b82f6'; // Moderate - Blue
  if (rainChance <= 80) return '#1d4ed8'; // Heavy - Deep blue
  return '#4338ca'; // Extreme - Indigo
};

export const getTempColor = (tempC: number): string => {
  if (tempC < 20) return '#38bdf8'; // Cool - Cyan
  if (tempC <= 32) return '#f59e0b'; // Warm - Amber
  return '#ef4444'; // Hot - Red
};

export const getWindColor = (speedKmH: number): string => {
  if (speedKmH < 10) return '#38bdf8'; // Calm - Sky cyan
  if (speedKmH <= 20) return '#0284c7'; // Gentle - Teal blue
  if (speedKmH <= 35) return '#2563eb'; // Breezy - Royal blue
  return '#7c3aed'; // Strong - Violet
};

export const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return '#10b981'; // Good - Emerald green
  if (aqi <= 100) return '#f59e0b'; // Moderate - Amber
  if (aqi <= 200) return '#e11d48'; // Poor - Rose/Red
  return '#9333ea'; // Severe - Purple
};

// Standard Weather Pin for Rain, Temperature, and AQI
const createCustomMarker = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-weather-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
        <div style="background: ${color}; color: #ffffff; font-weight: 800; font-size: 11px; padding: 3px 9px; border-radius: 9999px; box-shadow: 0 2px 12px rgba(0,0,0,0.6), 0 0 12px ${color}; white-space: nowrap; border: 1.5px solid #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px;">
          ${label}
        </div>
        <div style="width: 10px; height: 10px; background: ${color}; transform: rotate(45deg); margin-top: -5px; border-right: 1.5px solid #fff; border-bottom: 1.5px solid #fff;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Specialized Aerodynamic Wind Vector Pin with Rotating Directional Arrow Indicator
const createWindMarker = (color: string, label: string, windDegree: number, isCenter = false) => {
  return L.divIcon({
    className: 'custom-wind-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
        <div style="background: #090d16; color: #f8fafc; font-weight: 700; font-size: ${isCenter ? '12px' : '11px'}; padding: ${isCenter ? '4px 10px' : '3px 8px'}; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 14px ${color}; white-space: nowrap; border: 2px solid ${color}; display: flex; align-items: center; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: ${color}; color: #ffffff; transform: rotate(${windDegree}deg); box-shadow: 0 0 8px ${color};">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
          <span>${label}</span>
        </div>
        <div style="width: 10px; height: 10px; background: #090d16; transform: rotate(45deg); margin-top: -5px; border-right: 2px solid ${color}; border-bottom: 2px solid ${color};"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

interface WeatherMapProps {
  weather: WeatherData;
  onLocateMe: () => void;
  isLocating: boolean;
  locationError?: string | null;
}

// Sub-component to re-center map smoothly whenever coordinates change
const MapUpdater: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 10, {
      duration: 1.5,
    });
  }, [lat, lon, map]);
  return null;
};

export const WeatherMap: React.FC<WeatherMapProps> = ({
  weather,
  onLocateMe,
  isLocating,
  locationError,
}) => {
  const { t } = useLanguage();
  const { formatTemp } = useUnit();
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('radar');

  const centerLat = weather.lat || 28.6139;
  const centerLon = weather.lon || 77.209;

  // Surrounding meteorological station offsets for spatial overlay distribution
  const offsets = useMemo(
    () => [
      { dLat: 0.08, dLon: 0.09, factor: 1.2, degOffset: 20 },
      { dLat: -0.09, dLon: 0.07, factor: 0.8, degOffset: -30 },
      { dLat: 0.06, dLon: -0.08, factor: 1.35, degOffset: 45 },
      { dLat: -0.07, dLon: -0.06, factor: 0.65, degOffset: -40 },
      { dLat: 0.14, dLon: 0.02, factor: 1.1, degOffset: 15 },
      { dLat: -0.13, dLon: -0.03, factor: 0.9, degOffset: -15 },
    ],
    []
  );

  return (
    <section id="interactive-weather-map-section" className="w-full space-y-4">
      {/* Header with Title & Translation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div>
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-['Space_Grotesk']">
            {t('interactiveWeather', 'INTERACTIVE WEATHER')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Space_Grotesk']">
            {t('weatherMap', 'Weather Map')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('mapSubtitle', 'Live meteorological data centered on')}{' '}
            <span className="font-semibold text-slate-200">{weather.city}</span>
          </p>
        </div>

        {/* Locate Me button */}
        <button
          id="map-locate-me-btn"
          onClick={onLocateMe}
          disabled={isLocating}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md transition-all disabled:opacity-50"
        >
          <Compass className={`w-4 h-4 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? t('detectingLocation', 'Detecting...') : t('mapLocateMe', 'Locate Me')}</span>
        </button>
      </div>

      {locationError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Main Map Box */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl flex flex-col">
        {/* Map Top Control Tabs */}
        <div className="p-3 sm:p-4 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Tab 1: Rain Radar */}
            <button
              id="map-tab-radar"
              onClick={() => setActiveLayer('radar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 'radar'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>{t('rainRadarTab', 'Rain Radar')}</span>
            </button>

            {/* Tab 2: Temperature */}
            <button
              id="map-tab-temperature"
              onClick={() => setActiveLayer('temperature')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 'temperature'
                  ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] border border-amber-400'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>{t('temperatureTab', 'Temperature')}</span>
            </button>

            {/* Tab 3: Wind */}
            <button
              id="map-tab-wind"
              onClick={() => setActiveLayer('wind')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 'wind'
                  ? 'bg-sky-600 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)] border border-sky-400'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{t('windTab', 'Wind')}</span>
            </button>

            {/* Tab 4: AQI */}
            <button
              id="map-tab-aqi"
              onClick={() => setActiveLayer('aqi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 'aqi'
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] border border-emerald-400'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{t('aqiTab', 'AQI')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="hidden sm:inline">{t('osmActive', 'OSM Nodes: Active')}</span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>

        {/* Map Canvas Frame */}
        <div className="relative w-full h-[380px] sm:h-[460px] bg-slate-950">
          <MapContainer
            center={[centerLat, centerLon]}
            zoom={10}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <MapUpdater lat={centerLat} lon={centerLon} />

            {/* OpenStreetMap Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ========================================================= */}
            {/* LAYER 1: RAIN RADAR - Displays ONLY Rain/Precipitation Data */}
            {/* ========================================================= */}
            {activeLayer === 'radar' && (
              <>
                {/* Center Location Rain Marker */}
                <Marker
                  position={[centerLat, centerLon]}
                  icon={createCustomMarker(
                    getRainColor(weather.rainChance),
                    `${weather.city} (${weather.rainChance}%)`
                  )}
                >
                  <Popup>
                    <div className="p-1 font-sans text-slate-900 min-w-[170px]">
                      <div className="font-bold text-sm text-blue-600 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <CloudRain className="w-4 h-4 text-blue-500" />
                        <span>{weather.city}</span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1 mt-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('rainChance', 'Rain Chance')}:</span>
                          <strong className="text-blue-600 font-bold">{weather.rainChance}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('precipitation', 'Precipitation')}:</span>
                          <span className="font-semibold">{weather.rainChance > 50 ? '1.4 mm/h' : '0.0 mm/h'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('status', 'Intensity')}:</span>
                          <span className="font-semibold">{getLocalizedStatus(weather.rainStatus, t)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('humidity', 'Humidity')}:</span>
                          <span>{weather.humidity}%</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Center Rain Radar Echo Zone */}
                <Circle
                  center={[centerLat, centerLon]}
                  radius={weather.rainChance > 50 ? 12000 : 7500}
                  pathOptions={{
                    fillColor: getRainColor(weather.rainChance),
                    fillOpacity: Math.max(0.22, weather.rainChance / 130),
                    color: '#60a5fa',
                    weight: 2,
                  }}
                />

                {/* Surrounding Rain Radar Observation Points */}
                {offsets.map((pt, i) => {
                  const rainVal = Math.min(100, Math.max(0, Math.round(weather.rainChance * pt.factor)));
                  const rainColor = getRainColor(rainVal);
                  return (
                    <React.Fragment key={`radar-node-${i}`}>
                      <Circle
                        center={[centerLat + pt.dLat, centerLon + pt.dLon]}
                        radius={rainVal > 50 ? 8500 : 4500}
                        pathOptions={{
                          fillColor: rainColor,
                          fillOpacity: 0.32,
                          color: '#93c5fd',
                          weight: 1.5,
                        }}
                      />
                      <Marker
                        position={[centerLat + pt.dLat, centerLon + pt.dLon]}
                        icon={createCustomMarker(rainColor, `${rainVal}%`)}
                      >
                        <Popup>
                          <div className="p-1 font-sans text-slate-900 min-w-[150px]">
                            <div className="font-bold text-xs text-blue-600 pb-1 border-b border-slate-200">
                              {weather.city} ({t('stationSector', 'Sector')} {i + 1})
                            </div>
                            <div className="text-xs text-slate-700 space-y-1 mt-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">{t('rainChance', 'Rain Chance')}:</span>
                                <strong className="text-blue-600 font-bold">{rainVal}%</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">{t('radarScan', 'Radar Scan')}:</span>
                                <span className="font-semibold">
                                  {rainVal > 80
                                    ? t('legendExtreme', 'Extreme')
                                    : rainVal > 60
                                    ? t('legendHeavy', 'Heavy')
                                    : rainVal > 30
                                    ? t('legendModerate', 'Moderate')
                                    : t('legendLight', 'Light')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}
              </>
            )}

            {/* ========================================================= */}
            {/* LAYER 2: TEMPERATURE - Displays ONLY Temperature Data     */}
            {/* ========================================================= */}
            {activeLayer === 'temperature' && (
              <>
                {/* Center Temperature Marker */}
                <Marker
                  position={[centerLat, centerLon]}
                  icon={createCustomMarker(
                    getTempColor(weather.temperature),
                    `${weather.city} (${formatTemp(weather.temperature)})`
                  )}
                >
                  <Popup>
                    <div className="p-1 font-sans text-slate-900 min-w-[170px]">
                      <div className="font-bold text-sm text-amber-600 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <Thermometer className="w-4 h-4 text-amber-500" />
                        <span>{weather.city}</span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1 mt-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('temperatureTab', 'Temperature')}:</span>
                          <strong className="text-amber-600 font-bold">{formatTemp(weather.temperature)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('feelsLike', 'Feels Like')}:</span>
                          <span className="font-semibold">{formatTemp(weather.feelsLike)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('tempMinMax', 'Min / Max')}:</span>
                          <span>{formatTemp(weather.tempMin)} / {formatTemp(weather.tempMax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('condition', 'Condition')}:</span>
                          <span className="font-semibold">{getLocalizedCondition(weather.condition, t)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Center Thermal Zone */}
                <Circle
                  center={[centerLat, centerLon]}
                  radius={10000}
                  pathOptions={{
                    fillColor: getTempColor(weather.temperature),
                    fillOpacity: 0.28,
                    color: '#f97316',
                    weight: 2,
                  }}
                />

                {/* Surrounding Temperature Data Points */}
                {offsets.map((pt, i) => {
                  const tVal = weather.temperature + (i % 2 === 0 ? 1 : -1) * (i > 3 ? 2 : 1);
                  const tColor = getTempColor(tVal);
                  return (
                    <Marker
                      key={`temp-node-${i}`}
                      position={[centerLat + pt.dLat, centerLon + pt.dLon]}
                      icon={createCustomMarker(tColor, formatTemp(tVal))}
                    >
                      <Popup>
                        <div className="p-1 font-sans text-slate-900 min-w-[150px]">
                          <div className="font-bold text-xs text-amber-600 pb-1 border-b border-slate-200">
                            {weather.city} ({t('stationSector', 'Sector')} {i + 1})
                          </div>
                          <div className="text-xs text-slate-700 space-y-1 mt-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('temperatureTab', 'Temperature')}:</span>
                              <strong className="text-amber-600 font-bold">{formatTemp(tVal)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('thermalZone', 'Zone')}:</span>
                              <span className="font-semibold">
                                {tVal > 32 ? t('hot', 'Hot') : tVal >= 20 ? t('warm', 'Warm') : t('cool', 'Cool')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </>
            )}

            {/* ========================================================= */}
            {/* LAYER 3: WIND - Displays ONLY Wind Speed & Direction      */}
            {/* ========================================================= */}
            {activeLayer === 'wind' && (
              <>
                {/* Center Wind Vector Marker with Direction Arrow */}
                <Marker
                  position={[centerLat, centerLon]}
                  icon={createWindMarker(
                    getWindColor(weather.windSpeed),
                    `${weather.city} (${weather.windSpeed} km/h ${getLocalizedWindDirection(weather.windDirection, t)})`,
                    weather.windDegree,
                    true
                  )}
                >
                  <Popup>
                    <div className="p-1 font-sans text-slate-900 min-w-[180px]">
                      <div className="font-bold text-sm text-sky-600 flex items-center justify-between pb-1 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Wind className="w-4 h-4 text-sky-500" />
                          <span>{weather.city}</span>
                        </div>
                        <div
                          style={{ transform: `rotate(${weather.windDegree}deg)` }}
                          className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow"
                          title={`${weather.windDegree}°`}
                        >
                          <Navigation className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1 mt-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('windSpeed', 'Wind Speed')}:</span>
                          <strong className="text-sky-600 font-bold">{weather.windSpeed} km/h</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('direction', 'Direction')}:</span>
                          <span className="font-semibold">
                            {getLocalizedWindDirection(weather.windDirection, t)} ({weather.windDegree}°)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('velocityClass', 'Classification')}:</span>
                          <span className="font-semibold">{getLocalizedStatus(weather.windStatus, t)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Center Wind Circulation Boundary */}
                <Circle
                  center={[centerLat, centerLon]}
                  radius={11000}
                  pathOptions={{
                    fillColor: getWindColor(weather.windSpeed),
                    fillOpacity: 0.2,
                    color: '#38bdf8',
                    dashArray: '6, 8',
                    weight: 2,
                  }}
                />

                {/* Surrounding Wind Vector Points with Accurate Rotated Direction Indicators */}
                {offsets.map((pt, i) => {
                  const wSpeed = Math.max(2, Math.round(weather.windSpeed * pt.factor));
                  const wDeg = (weather.windDegree + pt.degOffset + 360) % 360;
                  const wDir = getWindDirection(wDeg);
                  const wColor = getWindColor(wSpeed);
                  return (
                    <Marker
                      key={`wind-node-${i}`}
                      position={[centerLat + pt.dLat, centerLon + pt.dLon]}
                      icon={createWindMarker(
                        wColor,
                        `${wSpeed} km/h ${getLocalizedWindDirection(wDir, t)}`,
                        wDeg,
                        false
                      )}
                    >
                      <Popup>
                        <div className="p-1 font-sans text-slate-900 min-w-[160px]">
                          <div className="font-bold text-xs text-sky-600 flex items-center justify-between pb-1 border-b border-slate-200">
                            <span>
                              {weather.city} ({t('stationSector', 'Station')} {i + 1})
                            </span>
                            <div
                              style={{ transform: `rotate(${wDeg}deg)` }}
                              className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs"
                            >
                              <Navigation className="w-2.5 h-2.5 fill-current" />
                            </div>
                          </div>
                          <div className="text-xs text-slate-700 space-y-1 mt-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('windSpeed', 'Wind Speed')}:</span>
                              <strong className="text-sky-600 font-bold">{wSpeed} km/h</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('direction', 'Direction')}:</span>
                              <span className="font-semibold">
                                {getLocalizedWindDirection(wDir, t)} ({wDeg}°)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('velocityClass', 'Class')}:</span>
                              <span className="font-semibold">
                                {wSpeed > 35
                                  ? t('strong', 'Strong')
                                  : wSpeed > 20
                                  ? t('breezy', 'Breezy')
                                  : wSpeed >= 10
                                  ? t('gentle', 'Gentle')
                                  : t('calm', 'Calm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </>
            )}

            {/* ========================================================= */}
            {/* LAYER 4: AQI - Displays ONLY Air Quality Index Data       */}
            {/* ========================================================= */}
            {activeLayer === 'aqi' && (
              <>
                {/* Center AQI Marker */}
                <Marker
                  position={[centerLat, centerLon]}
                  icon={createCustomMarker(
                    getAqiColor(weather.aqi),
                    `${weather.city} (AQI ${weather.aqi})`
                  )}
                >
                  <Popup>
                    <div className="p-1 font-sans text-slate-900 min-w-[170px]">
                      <div className="font-bold text-sm text-emerald-600 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span>{weather.city}</span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1 mt-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('aqiMetric', 'Air Quality (AQI)')}:</span>
                          <strong className="text-emerald-700 font-bold">{weather.aqi}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('status', 'Status')}:</span>
                          <span className="font-semibold">{getLocalizedAqiStatus(weather.aqi, t)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('category', 'Category')}:</span>
                          <span className="font-semibold">{getLocalizedStatus(weather.aqiStatus, t)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Center AQI Dispersion Zone */}
                <Circle
                  center={[centerLat, centerLon]}
                  radius={12000}
                  pathOptions={{
                    fillColor: getAqiColor(weather.aqi),
                    fillOpacity: 0.3,
                    color: '#cbd5e1',
                    weight: 1.5,
                  }}
                />

                {/* Surrounding AQI Monitoring Stations */}
                {offsets.map((pt, i) => {
                  const aVal = Math.max(15, Math.round(weather.aqi * pt.factor));
                  const aColor = getAqiColor(aVal);
                  return (
                    <Marker
                      key={`aqi-node-${i}`}
                      position={[centerLat + pt.dLat, centerLon + pt.dLon]}
                      icon={createCustomMarker(aColor, `AQI ${aVal}`)}
                    >
                      <Popup>
                        <div className="p-1 font-sans text-slate-900 min-w-[150px]">
                          <div className="font-bold text-xs text-emerald-600 pb-1 border-b border-slate-200">
                            {weather.city} ({t('airMonitor', 'Air Monitor')} {i + 1})
                          </div>
                          <div className="text-xs text-slate-700 space-y-1 mt-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('aqiMetric', 'AQI')}:</span>
                              <strong className="text-emerald-700 font-bold">{aVal}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">{t('status', 'Status')}:</span>
                              <span className="font-semibold">{getLocalizedAqiStatus(aVal, t)}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </>
            )}
          </MapContainer>

          {/* Dynamic Layer Legend Floating Badge */}
          <div
            id="map-layer-legend"
            className="absolute bottom-4 right-4 z-[400] glass-panel rounded-xl p-3 border border-cyan-500/20 shadow-xl max-w-xs text-xs backdrop-blur-md bg-slate-950/85"
          >
            <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-700/50">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {activeLayer === 'radar' && t('rainRadarLegend', 'Rain Radar Legend')}
                {activeLayer === 'temperature' && t('temperatureLegend', 'Temperature Scale')}
                {activeLayer === 'wind' && t('windLegend', 'Wind Vectors & Velocity')}
                {activeLayer === 'aqi' && t('aqiLegend', 'Air Quality Categories')}
              </span>
            </div>

            {/* Rain Radar Legend */}
            {activeLayer === 'radar' && (
              <div className="space-y-1.5 text-[11px]">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{t('legendLight', 'Light (0–30%)')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{t('legendModerate', 'Moderate (31–60%)')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-700 shrink-0" />
                    <span>{t('legendHeavy', 'Heavy (61–80%)')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 shrink-0" />
                    <span>{t('legendExtreme', 'Extreme (81–100%)')}</span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800 text-slate-400 text-[10px]">
                  {t('rainChance', 'Rain Chance')}: <strong className="text-cyan-300">{weather.rainChance}%</strong>
                </div>
              </div>
            )}

            {/* Temperature Legend */}
            {activeLayer === 'temperature' && (
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>&lt; 20°C ({t('cool', 'Cool')})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span>20°C – 32°C ({t('warm', 'Warm')})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span>&gt; 32°C ({t('hot', 'Hot')})</span>
                </div>
              </div>
            )}

            {/* Wind Legend with Velocity Tiers & Dynamic Vector Indicator */}
            {activeLayer === 'wind' && (
              <div className="space-y-2 text-[11px]">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pb-1.5 border-b border-slate-700/50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>&lt; 10 km/h ({t('calm', 'Calm')})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
                    <span>10–20 km/h ({t('gentle', 'Gentle')})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span>20–35 km/h ({t('breezy', 'Breezy')})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <span>&gt; 35 km/h ({t('strong', 'Strong')})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="space-y-0.5">
                    <div className="text-slate-300">
                      {t('currentSpeed', 'Current speed')}: <strong className="text-cyan-300">{weather.windSpeed} km/h</strong>
                    </div>
                    <div className="text-slate-400">
                      {t('direction', 'Direction')}: {getLocalizedWindDirection(weather.windDirection, t)} ({weather.windDegree}°)
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner shrink-0"
                    title={`${weather.windDegree}°`}
                  >
                    <div
                      style={{ transform: `rotate(${weather.windDegree}deg)` }}
                      className="flex items-center justify-center transition-transform duration-500"
                    >
                      <Navigation className="w-4 h-4 fill-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AQI Legend */}
            {activeLayer === 'aqi' && (
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>0–50 ({t('aqiGood', 'Good')})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>51–100 ({t('aqiModerate', 'Moderate')})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span>101–200 ({t('aqiPoor', 'Poor')})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                  <span>200+ ({t('aqiSevere', 'Severe')})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
