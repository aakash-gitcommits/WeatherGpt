import React, { useState, useEffect } from 'react';
import { WeatherData } from '../../types/weather';
import { AutopilotRoutine } from '../../types/uniqueFeatures';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { loadSavedRoutines, saveRoutines } from '../../services/storageService';
import { fetchAutopilotAdvice, fetchEarlyAlertAdvice } from '../../services/aiService';
import { searchLocations } from '../../services/weatherService';
import {
  PlaneTakeoff,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Sparkles,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Sun,
  Wind,
  Shield,
  Loader2,
  RefreshCw,
  X,
  Radio,
  Zap,
} from 'lucide-react';

interface WeatherAutopilotProps {
  currentWeather: WeatherData;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeatherAutopilot: React.FC<WeatherAutopilotProps> = ({ currentWeather }) => {
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();

  const dayNames = [
    t('sun', 'Sun'),
    t('mon', 'Mon'),
    t('tue', 'Tue'),
    t('wed', 'Wed'),
    t('thu', 'Thu'),
    t('fri', 'Fri'),
    t('sat', 'Sat'),
  ];

  const [routines, setRoutines] = useState<AutopilotRoutine[]>(() => loadSavedRoutines());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loadingRoutineId, setLoadingRoutineId] = useState<string | null>(null);

  // New Routine Form State
  const [newName, setNewName] = useState('');
  const [newActivity, setNewActivity] = useState<AutopilotRoutine['activityType']>('commute');
  const [newLocation, setNewLocation] = useState(currentWeather.location || 'Delhi, India');
  const [newLat, setNewLat] = useState(currentWeather.lat);
  const [newLon, setNewLon] = useState(currentWeather.lon);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [newTravelInfo, setNewTravelInfo] = useState('');
  const [newEarlyAlert, setNewEarlyAlert] = useState(true);

  // Location search state for form
  const [locQuery, setLocQuery] = useState('');
  const [locSearchResults, setLocSearchResults] = useState<any[]>([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  // Sync to storage
  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  // Handle location search inside modal
  useEffect(() => {
    if (!locQuery || locQuery.length < 2) {
      setLocSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingLoc(true);
      try {
        const results = await searchLocations(locQuery);
        setLocSearchResults(results);
      } catch (e) {
        setLocSearchResults([]);
      } finally {
        setIsSearchingLoc(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [locQuery]);

  const toggleRoutineEnabled = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const toggleEarlyAlerts = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, earlyAlertsEnabled: !r.earlyAlertsEnabled } : r))
    );
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDayToggle = (dayIdx: number) => {
    setNewDays((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx].sort()
    );
  };

  const handleAddRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newRoutine: AutopilotRoutine = {
      id: `routine-${Date.now()}`,
      name: newName.trim(),
      activityType: newActivity,
      location: newLocation,
      lat: newLat,
      lon: newLon,
      daysOfWeek: newDays.length > 0 ? newDays : [1, 2, 3, 4, 5],
      startTime: newStartTime,
      endTime: newEndTime || undefined,
      travelInfo: newTravelInfo.trim() || undefined,
      enabled: true,
      earlyAlertsEnabled: newEarlyAlert,
      lastChecked: new Date().toISOString(),
    };

    setRoutines((prev) => [newRoutine, ...prev]);
    setIsAddModalOpen(false);

    // Reset form
    setNewName('');
    setNewTravelInfo('');

    // Trigger notification
    addNotification({
      title: t('routineCreated', 'Autopilot Routine Added'),
      message: `${newRoutine.name} has been scheduled for ${newRoutine.startTime}. WeatherGPT will monitor atmospheric conditions automatically.`,
      type: 'autopilot',
      severity: 'success',
      actionFeature: 'autopilot',
    });
  };

  // Run AI Weather Check on Routine
  const checkRoutineWeather = async (routine: AutopilotRoutine) => {
    setLoadingRoutineId(routine.id);
    try {
      const adviceText = await fetchAutopilotAdvice(routine, currentWeather, language);
      
      const rain = currentWeather.rainChance;
      const aqi = currentWeather.aqi;
      const wind = currentWeather.windSpeed;
      const temp = currentWeather.temperature;

      let suitability: AutopilotRoutine['lastAdvice']['suitability'] = 'optimal';
      if (rain > 65 || aqi > 250 || wind > 45 || temp > 40) {
        suitability = 'hazardous';
      } else if (rain > 40 || aqi > 180 || wind > 30 || temp > 35) {
        suitability = 'caution';
      } else if (rain > 20 || aqi > 120 || temp > 32) {
        suitability = 'moderate';
      }

      const updatedAdvice = {
        text: adviceText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: currentWeather.temperature,
        condition: currentWeather.condition,
        rainChance: currentWeather.rainChance,
        aqi: currentWeather.aqi,
        windSpeed: currentWeather.windSpeed,
        suitability,
      };

      setRoutines((prev) =>
        prev.map((r) =>
          r.id === routine.id
            ? { ...r, lastAdvice: updatedAdvice, lastChecked: new Date().toISOString() }
            : r
        )
      );

      // If suitability is caution or hazardous, dispatch notification!
      if (suitability === 'caution' || suitability === 'hazardous') {
        addNotification({
          title: `Weather Advisory: ${routine.name}`,
          message: `Atmospheric caution for your ${routine.startTime} schedule in ${routine.location}. Rain chance: ${rain}%, Temp: ${temp}°C, AQI: ${aqi}.`,
          type: 'early_alert',
          severity: suitability === 'hazardous' ? 'critical' : 'warning',
          actionFeature: 'autopilot',
        });
      }
    } catch (e) {
      console.error('Check routine weather failed:', e);
    } finally {
      setLoadingRoutineId(null);
    }
  };

  // Simulate Early Alert Before Routine Trigger
  const triggerEarlyAlertSimulation = async (routine: AutopilotRoutine) => {
    const changeDescription = `Sudden precipitation spike detected (rain probability jumped from 20% to 75%) along with wind gusts up to 38 km/h.`;
    const aiAdvice = await fetchEarlyAlertAdvice(
      routine.name,
      routine.startTime,
      changeDescription,
      currentWeather,
      language
    );

    addNotification({
      title: `⚡ Early Alert Before Routine: ${routine.name}`,
      message: `${aiAdvice}`,
      type: 'early_alert',
      severity: 'warning',
      actionFeature: 'autopilot',
    });
  };

  const getSuitabilityBadge = (suitability?: string) => {
    switch (suitability) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('optimalConditions', 'Optimal')}</span>
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sun className="w-3 h-3" />
            <span>{t('moderateConditions', 'Moderate')}</span>
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>{t('cautionAdvised', 'Caution')}</span>
          </span>
        );
      case 'hazardous':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            <Shield className="w-3 h-3" />
            <span>{t('hazardousWeather', 'Hazardous')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <PlaneTakeoff className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {t('weatherAutopilotTitle', 'Weather Autopilot & Smart Routine Manager')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t(
                'weatherAutopilotDesc',
                'Schedule your daily commutes, college trips, outdoor workouts, or travel routines. WeatherGPT continuously tracks live atmospheric shifts and dispatches early warnings before your scheduled departure.'
              )}
            </p>
          </div>

          <button
            id="add-new-routine-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addRoutine', 'Add New Routine')}</span>
          </button>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className={`glass-panel p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
              routine.enabled
                ? 'border-cyan-500/30 hover:border-cyan-500/60 shadow-lg'
                : 'border-slate-800 opacity-70'
            }`}
          >
            <div>
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-700/50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {routine.name}
                    </h3>
                    {getSuitabilityBadge(routine.lastAdvice?.suitability)}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <strong className="text-white">{routine.startTime}</strong>
                      {routine.endTime && <span>- {routine.endTime}</span>}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{routine.location}</span>
                    </span>
                  </div>
                </div>

                {/* Enable Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleRoutineEnabled(routine.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routine.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    title={routine.enabled ? 'Enabled' : 'Disabled'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routine.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title={t('deleteRoutine', 'Delete Routine')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days of Week and Travel Notes */}
              <div className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-700/40">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <div className="flex gap-1">
                    {dayNames.map((day, idx) => (
                      <span
                        key={day}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          routine.daysOfWeek.includes(idx)
                            ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                            : 'bg-slate-800/80 text-slate-500'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEarlyAlerts(routine.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-colors ${
                      routine.earlyAlertsEnabled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                    title="Early alert prior to scheduled routine"
                  >
                    {routine.earlyAlertsEnabled ? (
                      <Bell className="w-3 h-3 text-amber-400" />
                    ) : (
                      <BellOff className="w-3 h-3" />
                    )}
                    <span>
                      {routine.earlyAlertsEnabled
                        ? t('earlyAlertsActive', 'Early Alerts On')
                        : t('earlyAlertsOff', 'Early Alerts Off')}
                    </span>
                  </button>
                </div>
              </div>

              {routine.travelInfo && (
                <div className="pt-2.5 text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">{t('travelNotes', 'Notes')}:</span>
                  <span>{routine.travelInfo}</span>
                </div>
              )}

              {/* AI Weather Advice Section */}
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('autopilotAdvice', 'AI Autopilot Telemetry')}</span>
                  </span>
                  {routine.lastAdvice && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {routine.lastAdvice.time}
                    </span>
                  )}
                </div>

                {routine.lastAdvice ? (
                  <div className="space-y-2">
                    {/* Live Metrics Row */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-slate-800/60 text-center">
                        <span className="text-[10px] text-slate-400 block">{t('temp', 'Temp')}</span>
                        <span className="text-xs font-bold text-white">
                          {routine.lastAdvice.temperature}°C
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/60 text-center">
                        <span className="text-[10px] text-slate-400 block">{t('rain', 'Rain')}</span>
                        <span className="text-xs font-bold text-cyan-400">
                          {routine.lastAdvice.rainChance}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/60 text-center">
                        <span className="text-[10px] text-slate-400 block">{t('aqiTab', 'AQI')}</span>
                        <span
                          className={`text-xs font-bold ${
                            routine.lastAdvice.aqi > 150 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {routine.lastAdvice.aqi}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/60 text-center">
                        <span className="text-[10px] text-slate-400 block">{t('wind', 'Wind')}</span>
                        <span className="text-xs font-bold text-slate-200">
                          {routine.lastAdvice.windSpeed} km/h
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {routine.lastAdvice.text}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {t(
                      'noAdviceYet',
                      'No atmospheric assessment generated yet. Click check weather below.'
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => checkRoutineWeather(routine)}
                disabled={loadingRoutineId === routine.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all border border-cyan-500/30 disabled:opacity-50"
              >
                {loadingRoutineId === routine.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{t('checkWeatherNow', 'Check Weather Telemetry')}</span>
              </button>

              <button
                onClick={() => triggerEarlyAlertSimulation(routine)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-medium transition-all border border-amber-500/30 active:scale-95"
                title="Simulate sudden weather change early warning alert"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('testEarlyAlert', 'Test Early Alert')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Routine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl glass-panel rounded-3xl p-6 shadow-2xl border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  {t('createRoutineTitle', 'Create Autopilot Routine')}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoutineSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t('routineNameLabel', 'Routine Name / Title')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('routineNamePlaceholder', 'e.g., Morning Office Commute, Gym Session, College')}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t('activityTypeLabel', 'Activity Type')}
                  </label>
                  <select
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="commute">{t('commuteTypeWork', 'Work Commute')}</option>
                    <option value="college">{t('commuteTypeCollege', 'College / School')}</option>
                    <option value="exercise">{t('commuteTypeExercise', 'Exercise / Jogging')}</option>
                    <option value="outdoor">{t('commuteTypeOutdoor', 'Outdoor Work')}</option>
                    <option value="travel">{t('commuteTypeTravel', 'Intercity Travel')}</option>
                    <option value="custom">{t('commuteTypeCustom', 'Other Custom Routine')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t('startTimeLabel', 'Scheduled Time (24h)')} *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location Picker */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t('routineLocationLabel', 'Routine Location')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('routineLocationPlaceholder', 'Search city or enter location name...')}
                    value={locQuery || newLocation}
                    onChange={(e) => {
                      setLocQuery(e.target.value);
                      setNewLocation(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {isSearchingLoc && (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-3 top-3" />
                  )}
                </div>

                {locSearchResults.length > 0 && (
                  <div className="mt-1 p-2 bg-slate-900 border border-slate-700 rounded-xl max-h-36 overflow-y-auto space-y-1">
                    {locSearchResults.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setNewLocation(`${loc.name}, ${loc.country}`);
                          setNewLat(loc.latitude);
                          setNewLon(loc.longitude);
                          setLocQuery('');
                          setLocSearchResults([]);
                        }}
                        className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-slate-200 text-xs flex justify-between"
                      >
                        <span>
                          {loc.name}, {loc.admin1}
                        </span>
                        <span className="text-slate-500">{loc.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Days Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {t('activeDaysLabel', 'Active Days of the Week')}
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {dayNames.map((day, idx) => {
                    const isSelected = newDays.includes(idx);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(idx)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-900 shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes & Travel Info */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t('travelNotesLabel', 'Travel Notes / Transport Details (Optional)')}
                </label>
                <input
                  type="text"
                  placeholder={t('travelNotesPlaceholder', 'e.g. Metro ride + 10 min walking, motorcycle commute')}
                  value={newTravelInfo}
                  onChange={(e) => setNewTravelInfo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Early Alerts Checkbox */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">
                    {t('earlyAlertOption', 'Enable Early Alert Monitoring')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {t('earlyAlertOptionDesc', 'Receive proactive notifications if rain, AQI, or storms develop prior to start time.')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newEarlyAlert}
                  onChange={(e) => setNewEarlyAlert(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  {t('saveRoutine', 'Save Routine')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
